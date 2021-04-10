import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { PostDetail } from "./PostDetail";
const maxPostPage = 10;

async function fetchPosts(page) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const queryClient = useQueryClient();

  const {
    data,
    isFetching,
    error,
    fetchNextPage,
    fetchPreviousPage,
    // if I change this key to ["posts", currentPage] then the pre-fetching works
    // according to dev tool. But does that mean I can't use pageParam / getNextPageParam
    // getPreviousPageParam ?
  } = useInfiniteQuery("posts", () => fetchPosts(currentPage), {
    staleTime: 5000,
    // toggling keepPreviousData doesn't seem to have an effect on whether prefetching works
    // when the key is "posts"
    keepPreviousData: true,
  });

  // Prefetch the next page
  useEffect(() => {
    if (currentPage < maxPostPage - 2) {
      // I also change this key to ["posts", currentPage] to get pre-fetching to
      // work
      queryClient.prefetchInfiniteQuery("posts", () =>
        fetchPosts(currentPage + 1)
      );
    }
  }, [currentPage, queryClient]);

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

  return (
    <>
      <ul>
        {data.pages[0].map((post) => (
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
        <button
          disabled={currentPage < 1}
          onClick={() => {
            setCurrentPage(currentPage - 1);
            // set pageParam so that fetchPreviousPage doesn't look for it in getPreviousPage.
            // pageParam is never actually used here...
            fetchPreviousPage({ pageParam: currentPage });
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        <button
          disabled={currentPage > maxPostPage - 2}
          onClick={() => {
            setCurrentPage(currentPage + 1);
            fetchNextPage({ pageParam: currentPage });
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
