# TourPackage — Web

Frontend for the TourPackage travel agency platform. The public marketing homepage (`/`) is fully
implemented against the real backend — see [Public Homepage](#public-homepage) below. Admin
authentication (login, forgot/reset password, dashboard, profile) is also fully implemented — see
[Authentication UI](#authentication-ui). The Hotel Module's customer-facing pages (`/hotels`,
`/hotels/[slug]`) and the Tour Package Module's (`/packages`, `/packages/[slug]`) are also
implemented — see [Hotel Module](#hotel-module) and [Tour Package Module](#tour-package-module).
**Booking** is implemented end-to-end for both hotels and tour packages as a four-step guest
checkout, with confirmation and booking history — see [Booking Flow](#booking-flow). The
[Contact Page](#contact-page) carries the enquiry form, company details, a map, and newsletter
signup. The **Admin Dashboard** (see [Admin Dashboard](#admin-dashboard)) covers reporting and all
nine back-office modules.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## Folder Structure

```
src/
├── app/
│   ├── page.tsx        # public homepage (/) — server component, SEO metadata + JSON-LD
│   ├── (auth)/         # login, forgot-password, reset-password — wrapped in GuestGuard
│   └── (dashboard)/    # dashboard, profile — wrapped in AuthGuard + DashboardShell
├── components/
│   ├── ui/            # shadcn/ui primitives
│   ├── layout/        # Site navbar/footer (public) + dashboard shell (admin)
│   ├── common/        # Shared presentational components (reveal, star rating, spinner, ...)
│   └── providers/     # React context/provider wiring (Query, Theme, Toaster, ...)
├── features/
│   ├── auth/           # types, zod schemas, API calls, TanStack Query hooks, forms, guards
│   ├── home/           # public homepage: types, API calls, query hooks, section components
│   ├── hotels/         # /hotels listing + detail: filters, rooms, amenities
│   ├── packages/       # /packages listing + detail: filters, itinerary, inclusions
│   ├── booking/        # multi-step hotel/package booking, confirmation, lookup
│   ├── contact/        # contact page: enquiry form and schema
│   ├── admin/          # dashboard + back-office module pages, charts, tables
│   └── cms/            # site content provider, gallery/blog pages, CMS admin screens
├── hooks/             # Reusable React hooks (incl. useInView for scroll-reveal animations)
├── services/          # API clients (Axios instance with JWT refresh interceptor)
├── store/             # Zustand stores (unused so far — auth state lives in TanStack Query)
├── types/             # Shared TypeScript types
├── utils/             # Framework-agnostic helper functions (error extraction, storage, formatting)
└── lib/               # Library configuration (query client, shadcn cn())
```

## Public Homepage

Eleven sections at `/`, all fetching from the backend's `/api/public/*` endpoints — nothing in a
content section is hardcoded. Verified against the real backend with Playwright, section by
section, in both light and dark mode, desktop and mobile.

Navbar, Hero Slider, Popular Destinations, Top Hotels, Best Tour Packages, Special Offers,
Testimonials, Travel Blogs, FAQ, Newsletter, Footer.

### What's genuinely dynamic vs. structural

Every **content** section (destinations, hotels, packages, offers, testimonials, blog posts, FAQs)
renders only what `features/home/hooks/use-home.ts` fetches — remove a row from the backend's seed
data and the corresponding card disappears, no fallback text. The footer's contact email/phone/
address and social links come from `GET /public/settings` (only rows flagged `is_public` on the
backend).

**Section headings, navigation, and page metadata are no longer hardcoded either.** An earlier
version of this file argued the nav arrays were a reasonable exception because the schema had no
"site navigation" entity. That reasoning was about the schema as it stood, not about what was
right — the schema gained one (see [CMS](#cms)), and the exception went with it. Nothing on the
public site is now written in a component.

### Design notes

- **Sections fail closed, not open**: every section component returns `null` if its query errors
  or comes back empty (`if (isError || (!isPending && !data?.length)) return null`), so a backend
  hiccup on, say, testimonials quietly removes that one section instead of showing a broken/empty
  block. Skeletons (`CardGridSkeleton` and per-section `Skeleton` layouts) cover the loading state
  for all nine content sections.
- **Scroll animations without a new dependency**: `useInView` (`hooks/use-in-view.ts`) wraps
  `IntersectionObserver`, and `<Reveal>` pairs it with Tailwind's `tw-animate-css` utility classes
  (fade + slide, staggered per-card via `delayMs`). The hero slider's actual carousel mechanics use
  `embla-carousel-react` (via shadcn's `Carousel`) since a real slider needs real drag/autoplay
  physics that CSS alone doesn't give you.
- **Image optimization throughout**: every photo (hero banners, destination/hotel/package cards,
  blog covers, testimonial avatars) goes through `next/image`, with `next.config.ts`
  `images.remotePatterns` scoped to the seed data's image host. No `<img>` tags.
- **SEO**: the homepage is a server component (`app/page.tsx`) so its `<title>`/`<meta>`/OpenGraph
  tags and a `TravelAgency` JSON-LD block are present in the initial HTML, not injected client-side
  after hydration. It renders `{ absolute: title }` rather than a plain string specifically to
  bypass the root layout's `%s — TourPackage` title template — otherwise the homepage's own
  from-scratch title would get the suffix appended twice.
- **Lucide dropped brand/trademark icons** (Facebook, Instagram, Twitter, Youtube) from the version
  pinned here — `site-footer.tsx` uses generic icons (globe, camera, message, video) that gesture at
  each platform instead. Found by the build failing on missing exports, not by inspection.
- **Seed images were content-checked, not just link-checked**: the first pass verified every
  Unsplash URL returned HTTP 200 and called it done — which shipped a camera product photo as
  "Bali" and Prague's skyline as "Rome" (right host, completely wrong photo). Caught by actually
  looking at the rendered destination cards in a screenshot, then fixed by downloading and viewing
  each image before assigning it to a place/person. A reachable URL is not the same claim as a
  correct one.

## Authentication UI

Five pages, all client components: `/login`, `/forgot-password`, `/reset-password`,
`/dashboard`, `/profile`. Verified against the real backend with Playwright (screenshots, not
just a passing build) — see the design notes below for a bug that testing caught but a type
check didn't.

### Architecture

- **No separate auth store.** `useProfileQuery()` (TanStack Query, `features/auth/hooks/use-auth.ts`)
  is the single source of truth for "who is logged in." Login primes its cache directly
  (`queryClient.setQueryData`); logout removes it. A second store holding the same data would just
  be a second place for it to go stale.
- **Tokens live in `localStorage` only** (`services/api-client.ts`), not a store — `AuthGuard` and
  `GuestGuard` read `getAccessToken()` straight from storage. This is a client-only architecture:
  there's no server-readable cookie, so auth state can't be checked in Next.js middleware. Every
  protected route shows a brief "Checking your session..." spinner on first paint while the client
  reads localStorage and confirms the token against `GET /profile` — that's the tradeoff for not
  needing a cookie-based session at all.
- **Refresh-and-retry interceptor**: a 401 (except from `/auth/login` and `/auth/refresh`
  themselves) triggers a silent `POST /auth/refresh`, and the original request is retried with the
  new token. Concurrent requests that 401 while a refresh is already in flight queue behind it
  instead of each firing their own refresh call. Confirmed working by corrupting a live access
  token mid-session and watching the app recover without bouncing to `/login`.
- **Standard-response-aware error handling** (`utils/errors.ts`): every mutation's `onError` runs
  through `getErrorMessage()` (toast) and `getFieldErrors()` (maps the backend's
  `fieldErrors: Record<string, string>` onto the matching react-hook-form field via `setError`, so
  server-side validation surfaces in the same place as client-side zod errors).
- **Zod schemas mirror the backend's validation exactly** (`features/auth/schemas.ts`) — the
  password regex in particular is copy-identical to `ResetPasswordRequest` on the API side, so a
  password that passes client validation never gets rejected server-side for a rule the user
  wasn't shown.

### A bug type-checking didn't catch

`DropdownMenuLabel` (base-ui's `Menu.GroupLabel` under the hood) requires a `Menu.Group` ancestor —
using it standalone compiled fine and passed lint, but crashed at render (caught by an error
boundary) the moment the user menu was opened, silently hiding the entire dropdown including
"Log out." Found by actually clicking the menu open in a real browser, not by reading the code.
Fixed by replacing it with a plain `<div>` for that profile-info block, since it isn't semantically
a group label. Moral: `yarn build` passing is necessary, not sufficient — this project verifies
UI changes with Playwright against the running app, not just the build.

## Hotel Module

Two customer-facing pages backed by `features/hotels/`: `/hotels` (search, filter, sort, paginate)
and `/hotels/[slug]` (gallery, amenities, rooms). Admin-side hotel management has no UI — it's
backend-only, consistent with the rest of this project's admin surface.

### `/hotels` — listing

- **Filter/sort/page state lives in the URL**, not component state (`hotels-listing-content.tsx`
  parses/writes `?q=&minPrice=&maxPrice=&stars=&amenities=&sort=&page=` via
  `useSearchParams`/`router.push`). A filtered, sorted, paginated view is a shareable/bookmarkable
  link and survives a refresh — component state wouldn't give either for free.
- **Search is debounced (400ms) client-side**; every other filter (star rating, amenities, price
  range on blur/Enter) commits immediately, since those are discrete choices rather than a
  keystroke stream.
- Amenity checkboxes come from `GET /public/amenities` (added specifically for this — the existing
  admin amenities endpoint requires auth, which a storefront filter panel can't use).
- Sort options map to the backend's plain `sort=property,direction` convention (`priceAsc` →
  `basePrice,asc`, etc.) — see `SORT_PARAM` in `features/hotels/api.ts`.

### `/hotels/[slug]` — detail

- **The existence check and SEO metadata are both server-side**, sharing one `fetch()` call
  (`app/hotels/[slug]/page.tsx`) that Next dedupes automatically between `generateMetadata` and the
  page body. A missing hotel calls `notFound()` from the Server Component, so the response is a
  real HTTP 404 — not a 200 with client-rendered "not found" copy, which is what an earlier version
  of this page did before being caught by an actual `curl -I` on a bad slug (see below).
- That same server-fetched hotel is passed to `HotelDetailContent` as `initialData` for
  `useHotelDetail`, so the client doesn't re-fetch on mount — the query only runs again on its own
  staleTime/refetch triggers.
- Gallery (`hotel-gallery.tsx`) is a plain click-to-swap main image + thumbnail strip, not a modal
  lightbox — the seed data ships one image per hotel, so the thumbnail strip only renders at all
  once a hotel actually has more than one.

### A bug the build didn't catch

The first version made the "hotel not found" check client-side only — a `useEffect` that called
`notFound()` after a `useQuery` resolved to a 404. `yarn build` and `yarn lint` both passed, and it
even looked correct in the browser (the not-found page rendered). What it actually produced was a
**200 status code** on a bad slug: the HTML document had already been served by the time the client
noticed the hotel didn't exist, so there was no way to change the response's status after the fact.
Caught by literally checking `curl -I`'s status line during Playwright verification, not by anything
that runs before then. Fixed by moving the existence check into the Server Component itself (see
above) — the general lesson repeated from the Authentication UI section: a passing build verifies
the code runs, not that it behaves correctly.

## Tour Package Module

`/packages` (search, filter, sort, paginate) and `/packages/[slug]` (gallery, itinerary,
inclusions), backed by `features/packages/`. Structurally the same as the Hotel Module — URL-synced
filter state, debounced search, server-side existence check for a real 404 — so this section covers
only what differs.

- **Filters are destination, price, duration, difficulty, and offers-only.** Destination is a
  select backed by `GET /public/destinations`; duration is a set of preset bands (1–3, 4–6, 7–9,
  10+ days) mapped to `minDurationDays`/`maxDurationDays` rather than two free-text number inputs,
  since "how long is the trip" is a browsing decision, not a precise one.
- **The itinerary renders as a vertical timeline** (`package-itinerary.tsx`) — a numbered node per
  day with a connecting rail that stops at the last one, plus per-day city/meals/accommodation
  metadata where the API returns it.
- **The image gallery is shared with the Hotel Module.** Both features needed a
  click-to-swap main image with a thumbnail strip over the identical `{id, url, altText,
  displayOrder, isCover}` shape, so it lives in `components/common/media-gallery.tsx` and takes a
  structural `GalleryImage` type; `features/hotels/components/hotel-gallery.tsx` was deleted in the
  process rather than left as a near-duplicate.

### A bug that lint, types, and functional tests all passed

The destination filter rendered its trigger as the literal string `__any__` — the sentinel value
standing in for "no destination selected" — and the sort dropdowns showed `recommended` and
`priceAsc` instead of their labels. base-ui's `Select.Value` renders the raw selected **value**
unless you give it a formatter function; it does not look up the matching `Select.Item`'s text the
way Radix does. Every functional assertion still passed, because the underlying values, URL state,
and filtered results were all correct — the component was doing exactly what it was told, and what
it was told was wrong only in what the user saw. Caught by looking at a screenshot, not by any
check that could have run without one. The fix is the children-as-function form:

```tsx
<SelectValue placeholder="Sort by">
  {(value: PackageSortOption | null) => (value ? SORT_LABELS[value] : "Sort by")}
</SelectValue>
```

This had been shipped broken in the Hotel Module's sort dropdown too, and was fixed there in the
same pass.

## Booking Flow

Two four-step flows sharing everything but their first step:

| | Hotel | Package |
|---|---|---|
| Route | `/hotels/[slug]/book` | `/packages/[slug]/book` |
| Entered from | a room's **Select Room** button | the detail page's **Book This Package** button |
| Step 1 | **Your stay** — room, check-in/check-out, party | **Your trip** — departure date, adults, children |
| Steps 2–4 | Guest details → Travellers → Review & pay | *(identical)* |

Both submit to `/bookings/confirmation`; `/bookings` looks an existing booking up later and lists
the rest of that email's history alongside it.

- **Steps 2–4 are shared components** (`components/steps/`), with the three common forms created by
  one `useBookingForms()` hook. The two flows own only their first step and their submit payload —
  which is the only place they actually differ. Extracting this cut the hotel booking route's
  bundle from 8.76 kB to 3.1 kB.
- **Each step is its own `useForm`**, validated on `Continue` via `trigger()` before advancing.
  Several small forms rather than one big one means a step only ever validates its own fields, and
  the running summary can watch the first step's form without re-rendering the rest.
- **Package price updates live as you change the party size**, using `pricePerAdult`/`pricePerChild`
  from the API rather than re-deriving the child discount client-side — so the quoted total and the
  charged total come from the same rule. The return date shown is derived from the package's
  duration exactly as the server derives it.
- **Traveller rows resize to match the party.** A package booking needs one traveller per person, so
  moving off the party-size step adds or removes rows to match, and the travellers step warns if
  they drift apart — rather than letting the guest fill in the wrong number and be rejected on
  submit.
- **Nothing is submitted until the last step.** The four forms' values are gathered into a single
  `POST /public/bookings/hotel` — matching the backend, which deliberately doesn't hold partial
  bookings server-side.
- **A sticky summary card recomputes as you type**, so the nightly rate × nights total updates the
  moment dates change rather than only at review.
- **Server-side validation errors are routed back to the step that owns the field.** A
  `guest.email` error from the API sends the user back to step 2 with the message attached to that
  input, rather than surfacing as a toast on a step where the offending field isn't visible.
- **Traveller rows use `useFieldArray`** (add/remove), with the first traveller always the lead —
  the backend enforces at most one lead per booking via a partial unique index, and defaults to the
  first if none is nominated, so the two agree by construction.
- **The booking lookup is gated on booking number + email**, matching the API, and shows the same
  "no booking matched" message for a wrong email as for a nonexistent number. Once a reference
  verifies, **"Your other bookings"** lists the rest of that email's history — hotels and packages
  interleaved, which is why the API returns one response shape for both.
- The booking and confirmation pages are `robots: noindex` — a half-finished checkout form has
  nothing to offer a search engine, and the confirmation page is per-booking.

### Responsive detail worth noting

The stepper's four labels don't fit a 390px viewport. Rather than letting it scroll off the edge —
which reads as broken rather than scrollable — completed and upcoming steps collapse to just their
numbered circles on small screens, and only the current step keeps its label. Caught by measuring
`scrollWidth` against `clientWidth` in the Playwright pass after the first screenshot showed
"Trave…" clipped at the viewport edge.

### A wording bug only a screenshot catches

The step labels started out as a shared `BOOKING_STEPS` constant, so the package flow's first step
read **"Your stay"** — hotel language for something that isn't a stay. Everything passed: the step
advanced, the form validated, the booking submitted. Fixed by making the labels a prop
(`HOTEL_BOOKING_STEPS` / `PACKAGE_BOOKING_STEPS`), since step 1 is exactly the step the two flows
don't share. The recurring lesson in this repo: a check that only asserts behaviour can't see text
that's wrong.

## Contact Page

`/contact` — enquiry form, company details, an embedded map, and newsletter signup.

- **Company details come from `GET /public/settings`**, the same source the footer uses, so the
  office address, phone, email, and business hours are edited in one place rather than being
  hardcoded on the page. While the request is in flight the fields show skeletons; there's no
  hardcoded fallback, because rendering a plausible-but-wrong phone number is worse than rendering
  nothing.
- **The map is an iframe embed, not the Maps JS SDK.** The page only needs to *show* a location,
  and the SDK would mean shipping a map library and exposing an API key for something a static
  embed does. Its query is the address from settings, so moving office updates the map too.
- **Newsletter reuses the homepage's `NewsletterSection`** rather than a second copy of the same
  form and mutation.
- **"Ask About This Trip"** on a package detail page links here with `packageId` and `packageTitle`,
  which pre-fills the message and shows a context banner — so the enquiry arrives already attached
  to the trip instead of the visitor having to describe which one they meant.
- On success the form swaps to a confirmation state with a **Send another message** button, rather
  than clearing itself and leaving the visitor unsure whether anything happened.

### Google Maps without a key

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is optional. With it set, the map uses Google's supported Maps
Embed API. Without it, it falls back to the keyless `maps.google.com/maps?q=…&output=embed`
endpoint, which needs no Google account — that's what makes the page work out of the box here. A
real deployment should set a key: the keyless endpoint is undocumented and Google can change it
without notice.

## Admin Dashboard

Behind `AuthGuard` at `/dashboard`. The sidebar groups nine modules into the three jobs an admin
actually does, rather than one flat list:

| Group | Modules |
|---|---|
| — | Dashboard |
| Operations | Bookings, Inquiries, Customers |
| Catalogue | Hotels, Packages |
| Content | Testimonials, FAQs, Newsletter, Settings |
| Account | Profile |

**Dashboard home** shows three revenue cards (total / this month / last month with change), six
count cards that link through to their module, a 12-month revenue bar chart, a bookings-by-status
donut, top sellers, and the latest eight bookings.

### Charts without a charting library

Both charts are hand-rolled SVG (`features/admin/components/charts.tsx`). Two chart shapes over a
dozen points each didn't justify a charting runtime — that would have cost more bundle than the
entire admin section. They scale via `viewBox` rather than measuring the DOM, and the donut uses
`stroke-dasharray` on concentric circles so there's no path arithmetic and it degrades to a clean
ring when every slice is zero. Same reasoning as `Reveal` using `IntersectionObserver` instead of an
animation library.

### Permissions

`features/auth/permissions.ts` mirrors the API's `@PreAuthorize` expressions so a role is never
offered a button that would 403 — `SUPPORT` sees booking and enquiry status dropdowns but no "New
testimonial" button and a read-only settings form; `EDITOR` gets content actions but still no
settings save. **This is presentation only.** The server is the sole enforcement point; hiding a
button doesn't protect an endpoint, and the verification pass checks both layers separately.

### Shared list primitives

Every module page is a filter row plus a table, so `AdminListState` owns the loading / error /
empty states and `AdminTable` owns the table chrome. That keeps nine pages consistent instead of
each inventing its own empty-state wording, and tables scroll inside their own container — a
horizontally scrolling admin layout is far worse than a horizontally scrolling table.

## CMS

No editorial copy lives in a component. Section headings, navbar and footer links, page metadata,
gallery photographs, blog posts, and slider banners all come from the API and are edited under
**Dashboard → CMS** (six screens: Slider & Heroes, Site Content, Gallery, Blog, Navigation, SEO).

### How content reaches the page

`fetchSiteContent()` runs once in the **root layout** — a server component — and the result is
handed down through `SiteContentProvider`. Components read it with `useBlock("home.hotels")` or
`useSiteContent()?.header`.

Fetching in the layout rather than per-component matters for two reasons: navigation and headings
are in the **first HTML response** instead of appearing after hydration (a navbar that pops in reads
as broken in a way a hardcoded one never did), and it's one request per page rather than one per
section.

### No fallback copy, on purpose

`useBlock` returns `null` when a block is missing, inactive, or the API is unreachable, and callers
render nothing rather than a built-in default. A fallback string would be a second copy of the
content that drifts from what the admin sees themselves editing — which is exactly the duplication
this layer exists to remove. Deactivating a block in the CMS therefore genuinely hides that heading.

### SEO

`generateMetadata` on each static route calls `metadataForPath("/hotels")`, which reads the
`page_seo` row server-side. Titles and descriptions are in the initial HTML where crawlers can see
them — the point of managing SEO rather than rendering it client-side. Blog posts derive their
metadata from the post instead, since `page_seo` has one row per route and posts are unbounded.

### One resource manager, six screens

The CMS admin screens are the same screen with different fields, so
`cms-resource-manager.tsx` takes a field description and `cms-screens.tsx` declares six
configurations against it. Six hand-written copies would have been ~1,500 lines that drift apart
the first time one gets a fix. The trade-off: a resource needing genuinely custom editing would
outgrow this and want its own component. The image picker turned out **not** to be such a case —
it went in as another `FieldType`, so every image field across all six screens gained it at once —
but rich text still would be.

### A layout bug the screenshot caught

The gallery gives every seventh photo a wide cell, via `lg:col-span-2`. That class was on the
`<figure>` — but the grid item is the `Reveal` wrapper around it, so the span did nothing and the
image just rendered squat instead of square. Everything "worked": the grid laid out, images loaded,
no error anywhere. Caught by looking at the screenshot and then measuring the elements
(600px vs 292px wide after the fix).

## Image Management

**Dashboard → CMS → Media Library** uploads, crops, compresses, browses and deletes images. Every
image field in the CMS (banner image, gallery photo, blog cover, OG image) is a `MediaPicker`: a URL
input with a **Browse** button onto the same library.

### Upload flow

Files are staged first, not sent on selection. Each staged file can be cropped or removed, and the
whole set goes up as **one** multipart request — so a batch either lands or doesn't, matching the
all-or-nothing behaviour on the server.

### The cropper is a canvas, not a dependency

`image-cropper.tsx` is ~200 lines of pointer events over a `<canvas>`: drag to move, corner to
resize, with Free / 16:9 / 4:3 / 1:1 presets. Crop coordinates are kept in displayed pixels and
converted to natural pixels (`naturalWidth / clientWidth`) only when writing to the canvas, so the
result is independent of how large the image happens to render.

### The URL field stays editable

The picker sets the field, it doesn't own it. Seeded content points at external URLs and an editor
may legitimately want to paste one, so **Browse** is a convenience over a normal text input rather
than a replacement for it.

### Reorder is drag *and* buttons

The gallery reorder strip supports dragging, but every tile also has up/down buttons — HTML5 drag
and drop is mouse-only, so a drag-only control would put reordering out of reach for anyone using a
keyboard. Order is applied locally and saved explicitly, so dragging across a list doesn't fire a
request per hop.

### A JSON header that broke every upload

The axios instance sets `Content-Type: application/json` for the whole app, which silently applied
to the `FormData` upload too — the request went out labelled JSON with a multipart body, and Spring
rejected it before the controller ran. The request interceptor now drops the header for `FormData`
bodies so the browser can set `multipart/form-data` with its own boundary. Worth noting how it
surfaced: the server returned a generic 500 and its catch-all handler logged nothing at all, so the
first fix was to make that handler log the stack trace.

## Global Search

A search box in the navbar (and inside the mobile menu) with an autocomplete dropdown, plus a
paginated `/search` results page with type tabs.

### Debouncing, and the second half of it

`useDebounced` holds the input for 250ms so a typist doesn't fire a request per keystroke —
measured at **1 suggest request for the 4 keystrokes of "bali"**. The other half is the TanStack
Query key: it is the *debounced* term, so re-typing something already searched renders from cache
without a request at all.

### Before anything is typed

Focusing the box opens the panel on recent and popular searches, so it is useful immediately rather
than only after input. Recent searches are localStorage, not server state — the site has no visitor
accounts, so there is nobody to attach a history to, and "what I personally searched" should stay on
the device that searched it. Reads happen after mount rather than during render, because
localStorage doesn't exist on the server and seeding state from it would mismatch the SSR markup.

### Keyboard

Arrow keys walk the flattened result list and wrap at both ends; Enter opens the highlighted result
or, with nothing highlighted, submits the term; Escape closes. The dropdown renders as groups but is
flattened once for navigation so the highlighted index and the rendered order cannot disagree.

### URL as state

The results page keeps the query, tab and page number in the URL. A search result page is something
people bookmark, share and reload, and all three need to survive that. Changing the query or tab
resets to page 0 — page 4 of the previous search is meaningless for the new one, and usually empty.

### Two bugs the screenshots caught

**The results page had no navbar or footer.** Every public page in this app renders its own
`SiteNavbar` / `main` / `SiteFooter` rather than inheriting them from a layout, and the new page
didn't. It rendered perfectly well and had no way to navigate anywhere.

**The logo collided with the first nav link.** The search box takes `flex-1`, which left nothing for
the navbar's `justify-between` to distribute, so the two sat flush against each other. Fixed with an
explicit `lg:gap-6` — scoped to `lg` because that is where the search box appears, and adding it at
`md` only made an already-overflowing row wider.

## SEO

### Where each tag comes from

| Route kind | Title & description | Image |
|---|---|---|
| Static pages (`/`, `/hotels`, `/contact`, …) | `page_seo` row in the CMS | `page_seo.og_image_url` |
| Hotel / package detail | the entity's own `metaTitle`/`metaDescription`, falling back to its summary | cover image |
| Blog post | the post's title and excerpt | cover image |

All of it is assembled by one builder, [`buildMetadata`](src/features/seo/metadata.ts). Four routes
used to hand-roll the same object, and all four had drifted apart — every one of them declared a
`summary_large_image` Twitter card and then supplied **no image for it**, which silently downgrades
to a small card. Centralising fixed all four at once, and the card type is now derived from whether
an image exists rather than asserted.

Descriptions are truncated to 160 characters on a word boundary. Several of them come from the first
160 characters of a body, which routinely lands mid-word.

### Structured data

`Organization` (as `TravelAgency`) and `WebSite` are emitted once in the root layout, so a crawler
landing on any page learns who runs the site. Both are built from the same `settings` rows the footer
renders — including `sameAs` from the social links, which is what ties the site to its profiles.
`WebSite` carries a `SearchAction` pointing at `/search?q={search_term_string}`, the global search
route.

Per-page: `Hotel` (with `starRating` and `aggregateRating` kept distinct — they are different
properties and conflating them is a common mistake), `TouristTrip` with an `Offer` at the
discounted price and the itinerary as an `ItemList`, `BlogPosting`, `FAQPage` on the homepage, and
`BreadcrumbList` on every detail page.

An `aggregateRating` is only emitted when `ratingCount > 0` — "rated 0 by 0 people" is invalid
structured data, not a neutral default.

The homepage previously declared its own thin `TravelAgency` node. Once the layout gained a richer
one, that became a second conflicting copy of the same entity on the same page, and it was removed.

### robots.txt and noindex are not interchangeable

`robots.txt` disallows only `/dashboard`, `/search` and `/api/` — surfaces a crawler should never
fetch at all. Everything else that must stay out of the index (the auth pages, `/profile`,
`/bookings`, the booking flow) carries a **`noindex` meta tag** and is deliberately *not* disallowed:
a `Disallow` stops the crawler fetching the page, and a noindex it never fetches is a noindex it
never reads. Blocking and noindexing the same URL leaves it indexable-by-reference with no
description — the opposite of the intent.

The sitemap and robots list are kept consistent by construction: nothing disallowed appears in the
sitemap, which is verified rather than assumed.

### Sitemap

`sitemap.xml` is generated from `/public/seo/sitemap`, which returns slugs and `updatedAt` only.
`lastModified` on detail pages is the real database timestamp, which is the one field in a sitemap a
crawler acts on — it decides what to re-fetch. A failed fetch degrades to the static routes rather
than 500ing, because a 500 on `/sitemap.xml` tells a crawler the whole file is broken.

## Production Readiness

### Tests

`yarn test` runs Vitest over the pure logic that carries real risk: URL construction, description
truncation, card-type selection, and every structured-data builder. The environment is `node`, not
jsdom — none of this touches the DOM, and jsdom's `whatwg-url` dependency requires Node 22 while this
project targets 20. Component behaviour is covered by the Playwright passes, which drive a real
browser rather than a simulated one.

Writing these split `structured-data.tsx` into a pure `schemas.ts` plus the component that renders
them, which is the better boundary regardless: the builders are functions of their inputs and now
testable without parsing JSX.

### Typecheck in CI

`yarn tsc --noEmit` runs as its own CI step rather than relying on `next build`. It immediately
earned that: it caught type errors in a test file that ESLint passed cleanly.

### Security headers

Set in `next.config.ts` for every route: `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`
(password-reset links carry tokens in the query string), a `Permissions-Policy` denying camera,
microphone, geolocation and payment, and HSTS. `poweredByHeader` is off.

### CI

Lint, typecheck, unit tests, build, then a Docker image build. `--frozen-lockfile` so CI fails on a
lockfile that disagrees with `package.json` rather than silently resolving different versions than a
developer got.

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (this project's lockfile is `yarn.lock`)

> Note: `npm install` may be flaky depending on your network/registry setup. This project was set up and verified with `yarn`.

### Install & Run

```bash
cp .env.example .env.local
yarn install
yarn dev
```

The app runs at http://localhost:3000.

### Scripts

| Command      | Description                       |
| ------------ | ---------------------------------- |
| `yarn dev`   | Start the dev server (Turbopack)   |
| `yarn build` | Production build                   |
| `yarn start` | Run the production build           |
| `yarn lint`  | Run ESLint                         |

### Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```

## Environment Variables

See [`.env.example`](./.env.example).

| Variable              | Description                    |
| ---------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Base URL of the Spring Boot API |
| `NEXT_PUBLIC_APP_URL`  | Public URL of this app          |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional — see [Google Maps without a key](#google-maps-without-a-key) |

## Docker

```bash
docker build -t tourpackage-web \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080/api \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  .
docker run -p 3000:3000 tourpackage-web
```

Or run the full stack (web + api + Postgres + Mailhog) via the [root `docker-compose.yml`](../docker-compose.yml).
