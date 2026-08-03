import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "./section-heading";
import { BlogCard } from "./blog-card";
import { useRecentBlogPosts } from "../hooks/use-home";

export function TravelBlogs() {
  const { data: posts, isPending, isError } = useRecentBlogPosts(6);

  if (isError || (!isPending && (!posts || posts.length === 0))) {
    return null;
  }

  return (
    <section id="blog" className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading blockKey="home.blog" />

        {isPending ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts!.map((post, i) => (
              <Reveal key={post.id} delayMs={i * 60}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
