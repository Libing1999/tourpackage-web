import Image from "next/image";
import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";
import type { BlogPostSummary } from "../types";

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <Card className="group overflow-hidden py-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        <Badge variant="secondary" className="absolute left-3 top-3">
          {post.category}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-2 p-4">
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readTimeMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readTimeMinutes} min read
            </span>
          ) : null}
        </p>
        <h3 className="line-clamp-2 font-semibold text-foreground">{post.title}</h3>
        {post.excerpt ? <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p> : null}
        {post.authorName ? <p className="mt-1 text-xs text-muted-foreground">By {post.authorName}</p> : null}
      </CardContent>
    </Card>
  );
}
