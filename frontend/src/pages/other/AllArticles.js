import React, { useState } from "react"

import "./pages.css"

import { v4 as uuidv4 } from "uuid"

import { IoSearchSharp } from "react-icons/io5"

import loadingImg from "../../images/loading_screen.png"

function AllArticles({ articles, isError }) {
  const [displayingArticles, setdisplayingArticles] = useState(articles)
  const [query, setquery] = useState("")

  function handleQueryChange(e) {
    const value = e.target.value

    setquery(value)

    // change the displaying articles:
    setdisplayingArticles(() =>
      articles.filter((article) =>
        article.title.toLowerCase().includes(value.toLowerCase())
      )
    )
  }

  return (
    <div className="all-articles-page">
      <p className="page-description">All recent articles about the NBA.</p>
      <h1 className="page-title">All Articles</h1>
      {articles ? (
        <>
          <div className="all-articles-container">
            <div className="title-container">
              <h2 className="title">All Articles</h2>
              <div className="search-container">
                <input
                  value={query}
                  placeholder="Search Articles"
                  onChange={handleQueryChange}
                  maxLength={30}
                />
                <button>
                  <IoSearchSharp />
                </button>
              </div>
            </div>
            <div className="titles-container">
              <h2 className="article-title">Title</h2>
              <h2 className="source-title">Source</h2>
            </div>
            {displayingArticles.length ? (
              displayingArticles.map((article, index) => (
                <div
                  key={uuidv4()}
                  className={
                    "article-container " +
                    (index % 2 === 0 ? "even " : "") +
                    (index === displayingArticles.length - 1
                      ? "last-article"
                      : "")
                  }
                >
                  <a className="link" href={article.url}>
                    {article.title}
                  </a>
                  <em className="source">{article.source}</em>
                </div>
              ))
            ) : (
              <p className="no-articles-msg">No articles found</p>
            )}
          </div>
          <div className="scroll-expander">hi</div>
        </>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} alt="loading" />
          {isError ? (
            <p>It looks like we have a problem. try again later!</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AllArticles
