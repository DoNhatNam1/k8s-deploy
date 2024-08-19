

import { prisma } from "@shared/configs";

import { cache } from "react";

const getPosts = cache(async (postSlug: string) => {
    const post = await prisma.tbPosts.findUnique({
      where: { postSlug }
    });
  
    return post;
  })

  export default getPosts;