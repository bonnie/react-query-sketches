import { useState } from "react";
import { useInfiniteQuery } from "react-query";

import { PostDetail } from "./PostDetail";

async function fetchPosts(page) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`
  );
  return response.json();
}

export function Posts() {
  // const [page, setPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const {
    data,
    isFetching,
    error,
    fetchNextPage,
    fetchPreviousPage,
  } = useInfiniteQuery("posts", ({ pageParam = 0 }) => fetchPosts(pageParam), {
    staleTime: 5000,
    keepPreviousData: true,
    getNextPageParam: (lastPage, allPages) => {
      console.log("LP", lastPage);
      console.log("AP", allPages);
      return allPages.length + 1;
    },
    getPreviousPageParam: (lastPage, allPages) => allPages.length - 1,
  });

  if (isFetching) {
    return <h3>Loading!</h3>;
  }

  if (error) {
    return (
      <>
        <h3>Error</h3>
        <p>{error.toString()}</p>
      </>
    );
  }

  if (!data) return null;

  console.log("<<<<<<<<<<<<<", data);
  const pageNum = data.pageParams.length - 1;

  return (
    <>
      <ul>
        {data.pages[pageNum].map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button enabled={true} onClick={fetchPreviousPage}>
          Previous page
        </button>
        <span>Page {pageNum}</span>
        <button onClick={fetchNextPage}>Next page</button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
