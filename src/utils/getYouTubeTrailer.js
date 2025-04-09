function getYouTubeTrailerUrl(title, year) {
  const query = `${title} (${year}) trailer`;
  const encodedQuery = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
}

module.exports = getYouTubeTrailerUrl;
