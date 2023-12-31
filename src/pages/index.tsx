import { useState } from "react";
import MovieList from "~/components/MovieList";
import SearchBar from "~/components/Search";

export default function Home() {
  const [search, setSearch] = useState<string | undefined>();
  const [genre, setGenre] = useState<string | undefined>();

  return (
    <div>
      <SearchBar setSearch={setSearch} setGenre={setGenre} />
      <MovieList search={search} genre={genre} />
    </div>
  );
}
