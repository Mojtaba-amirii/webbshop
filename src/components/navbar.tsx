import { FaShoppingBasket } from "react-icons/fa";
import HamburgerMenu from "./hamburger";
import Link from "next/link";
import React from "react";
import { useAnimation } from "./AnimationContext";
import "tailwindcss-animatecss";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { animationTriggered } = useAnimation();
  const { data: sessionData } = useSession();

  return (
    <header>
      <nav className=" sticky flex  w-full items-center justify-between bg-sky-400 px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-bold">
            <h1>MOVIESHOP</h1>
          </Link>
          <div className="text-xl lg:hidden">
            <HamburgerMenu />
          </div>
          <div className="hidden lg:block">
            <ul className="flex  font-bold">
              <li>
                <button
                  className="border-r-2 border-black pr-4"
                  type="button"
                  onClick={
                    sessionData ? () => void signOut() : () => void signIn()
                  }
                >
                  {sessionData ? "Sign out" : "Sign in"}
                </button>
              </li>
              {sessionData ? (
                <>
                  <li>
                    <Link
                      href="/myprofile"
                      className="border-r-2 border-black px-4 font-bold"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mymovies"
                      className="border-r-2 border-black px-4  font-bold "
                    >
                      My Movies
                    </Link>
                  </li>
                </>
              ) : (
                ""
              )}
              <li>
                <Link href="/About" className="pl-4 font-bold">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Link
          title="ShoppingBasket"
          href="/cart-pages/cart"
          className={`text-2xl ${animationTriggered ? "animate-bounce" : ""}`}
        >
          {sessionData ? <FaShoppingBasket /> : " "}
        </Link>
      </nav>
    </header>
  );
}
