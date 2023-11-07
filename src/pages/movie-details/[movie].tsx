import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { Movie, MovieWithPrice } from "~/types/types";
import { api } from "~/utils/api";
import { useDispatch } from "~/redux/store";
import { addItem } from "~/redux/cartSlice";
import { useAnimation } from "~/components/AnimationContext";
import { signIn, signOut, useSession } from "next-auth/react";

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

export default function MovieDetails() {
  const [validatedMovie, setValidatedMovie] = useState<MovieWithPrice>();
  const { setAnimationTriggered } = useAnimation();
  const router = useRouter();
  const { data: sessionData } = useSession();
  console.log(router.query.movie);
  console.log(router.query.price);

  const movie = api.movies.findByTitle.useQuery({
    title: router.query.movie as string,
  }).data;
  console.log(movie);

  useEffect(() => {
    console.log('hejsan')
    if (movie) {
      const movieWithPrice = {...movie, price: Number(router.query.price)}
      console.log(movieWithPrice)
      if (movieWithPrice.poster) {
        checkURL(movieWithPrice.poster)
          .then((result: boolean) => {
            if (result) {
              console.log("YES!");
              setValidatedMovie(movieWithPrice);
            } else {
              console.log("NO!");
              setValidatedMovie({ ...movieWithPrice, poster: "/image-not-found.jpg" });
            }
          })
          .catch((error) => console.log(error));
      } else {
        setValidatedMovie({ ...movieWithPrice, poster: "/image-not-found.jpg" });
      }
    }
  }, [movie]);

  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (validatedMovie) {
      dispatch(addItem(validatedMovie));
      setAnimationTriggered(true);
      setTimeout(() => {
        setAnimationTriggered(false);
      }, 1000);
    }
  };

  return (
    <div>
      {validatedMovie ? (
        <div className="mx-auto flex w-[90%] flex-col items-center">
          <h1 className="text-2xl font-bold">{validatedMovie.title}</h1>
          <Image
            src={validatedMovie.poster ? validatedMovie.poster : ""}
            alt={validatedMovie.title}
            width={80}
            height={96}
            priority
            className="mb-2 sm:h-32 sm:w-24 md:h-44 md:w-36 lg:h-56 lg:w-40 xl:h-64 xl:w-56"
          />
          <div className="flex">
            <h2>Genres:&nbsp;</h2>
            <div>{validatedMovie.genres.join(", ")}</div>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: validatedMovie.fullplot
                ? validatedMovie.fullplot
                : validatedMovie.plot
                ? validatedMovie.plot
                : "No Plot Available",
            }}
          ></div>
          <p className="text-lg font-semibold">{validatedMovie.price} kr</p>
          {sessionData ? <button
            type="button"
            className="sm:text-md md:text-l rounded-md border border-black bg-sky-400 px-4 py-2 text-sm lg:text-xl xl:text-2xl"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button> : (<div className="flex flex-col items-center"><button
            type="button"
            className="sm:text-md md:text-l rounded-md border border-black bg-sky-400 opacity-20 px-4 py-2 text-sm lg:text-xl xl:text-2xl w-fit"
            onClick={handleAddToCart}
            disabled
          >
            Add to Cart
          </button> 
          <p className="text-red-400 text-lg">Sign in to add movie to cart</p></div>)}
          
        </div>
      ) : (
        "Loading..."
      )}
    </div>
  );
}
