import React, { useEffect, useState } from "react";
import { useSelector } from "~/redux/store";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import type { MovieWithPrice } from "~/types/types";
import { useSession } from "next-auth/react";
import type { RootState } from "~/redux/types";

type SearchProps = {
  search: string | undefined;
  genre: string | undefined;
};

function generateRandomPrice() {
  return Math.floor(Math.random() * 51 + 50);
}

async function checkURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export default function MovieList({ search, genre }: SearchProps) {
  const { data: sessionData } = useSession();
  const [validatedMovies, setValidatedMovies] = useState<MovieWithPrice[]>();

  const myMoviesIds = api.user.getMyMovies.useQuery(
    { userId: sessionData?.user?.id ? sessionData.user.id : "" },
    { enabled: sessionData !== null },
  ).data?.purchasedMovies;

  const cartMovies = useSelector((state: RootState) => state.cart.items);

  //const dispatch = useDispatch();
  const movies = api.movies.first100.useQuery().data;

  useEffect(() => {
    console.log("hej");
    if (movies) {
      const moviesWithPrice = movies.map((movie) => {
        return { ...movie, price: generateRandomPrice() };
      });
      Promise.all(
        moviesWithPrice.map(async (movie: MovieWithPrice) => {
          /* const randomPrice = generateRandomPrice();
          dispatch(setMoviePrice({ movieId: movie.id, price: randomPrice })); */

          if (movie.poster) {
            return checkURL(movie.poster).then((result: boolean) => {
              if (result) {
                console.log("YES!");
                return movie;
              } else {
                console.log("NO!");
                return { ...movie, poster: "/image-not-found.jpg" };
              }
            });
          } else {
            return Promise.resolve({
              ...movie,
              poster: "/image-not-found.jpg",
            });
          }
        }),
      )
        .then((updatedMovies) => {
          if (sessionData) {
            const myMoviesChecked = updatedMovies.filter(
              (movie) => !myMoviesIds?.includes(movie.id),
            );
            setValidatedMovies(myMoviesChecked);
          } else {
            setValidatedMovies(updatedMovies);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [movies, sessionData, myMoviesIds]);

  console.log("Search: ", search);
  console.log("Genre: ", genre);

  // Filter movies based on the Search
  const filteredMovies = validatedMovies?.filter((movie: MovieWithPrice) => {
    if (movie) {
      const isSearchMatch =
        !search || movie.title.toLowerCase().includes(search.toLowerCase());

      // Filter movies based on the selected genre
      const isGenreMatch =
        !genre ||
        genre === "all" ||
        movie.genres.map((g) => g.toLowerCase()).includes(genre.toLowerCase());

      return isSearchMatch && isGenreMatch;
    }
    return false;
  });

  return (
    <div>
      <ul className="mx-1 grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filteredMovies?.map((movie) =>
          sessionData ? (
            <li
              key={movie.id}
              className="flex flex-col items-center rounded-md border p-3"
            >
              <Link
                href={{
                  pathname: "/movie-details/[movie]",
                  query: {
                    price: movie.price,
                  },
                }}
                as={`/movie-details/${movie.title}`}
              >
                <div
                  className={`${
                    cartMovies.filter((cartMovie) => cartMovie.id === movie.id)
                      .length !== 0 && "opacity-40"
                  }  aspect-w-24 aspect-h-12`}
                >
                  <Image
                    src={movie.poster ?? "/image-not-found.jpg"}
                    alt={movie.title}
                    width={600}
                    height={696}
                    priority
                    className="mx-auto mb-2 h-auto w-full "
                  />
                </div>
                <div
                  className={`${
                    cartMovies.filter((cartMovie) => cartMovie.id === movie.id)
                      .length !== 0 && "opacity-40"
                  } text-center`}
                >
                  <div className="text-lg font-semibold">{movie.title}</div>
                  <div className="flex flex-col">
                    <h2>Genres:&nbsp;</h2>
                    <div>{movie.genres.join(", ")}</div>
                  </div>
                  <div>Price: {movie.price} kr</div>
                </div>
                {cartMovies.filter((cartMovie) => cartMovie.id === movie.id)
                  .length !== 0 && (
                  <p className="text-center font-bold text-red-500">
                    {" "}
                    Added to cart{" "}
                  </p>
                )}
              </Link>
            </li>
          ) : (
            <li
              key={movie.id}
              className="flex flex-col items-center rounded-md border p-3"
            >
              <Link
                href={{
                  pathname: "/movie-details/[movie]",
                  query: {
                    price: movie.price,
                  },
                }}
                as={`/movie-details/${movie.title}`}
              >
                <div className="aspect-w-24 aspect-h-12 ">
                  <Image
                    src={movie.poster ?? "/image-not-found.jpg"}
                    alt={movie.title}
                    width={600}
                    height={696}
                    priority
                    className="mx-auto mb-2 h-auto w-full "
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{movie.title}</div>
                  <div className="flex flex-col">
                    <h2>Genres:&nbsp;</h2>
                    <div>{movie.genres.join(", ")}</div>
                  </div>
                  <div>Price: {movie.price} kr</div>
                </div>
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
