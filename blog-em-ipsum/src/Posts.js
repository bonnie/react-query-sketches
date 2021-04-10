import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
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

  const { data, isFetching, isLoading, error } = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 5000,
      // If set, any previous data will be kept when fetching new data because the query key changed.
      keepPreviousData: true,
    }
  );

  // Prefetch the next page
  useEffect(() => {
    if (currentPage < maxPostPage - 2) {
      const newPage = currentPage + 1;
      queryClient.prefetchQuery(["posts", newPage], () => fetchPosts(newPage));
    }
  }, [currentPage, queryClient]);

  if (isLoading) {
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
        {data.map((post) => (
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
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        {isFetching ? <span>loading...</span> : null}
        <button
          // can use indicator from data (e.g. !data.nextPage) if available
          disabled={currentPage > maxPostPage - 2}
          onClick={() => {
            console.log("setting current page to", currentPage + 1);
            setCurrentPage(currentPage + 1);
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
