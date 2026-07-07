"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  return (
    <section className="max-w-[760px] mx-auto py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,40px)] text-center">
      <div className="font-hanken text-[11px] font-semibold tracking-[.3em] uppercase text-accent mb-5">
        The newsletter
      </div>
      <div className="font-playfair font-normal text-[clamp(30px,4.4vw,50px)] leading-[1.1] mb-5 [text-wrap:balance]">
        Join the thread.
      </div>
      <p className="text-[16px] leading-[1.6] text-body-1 max-w-[46ch] mx-auto mb-[30px]">
        A letter from the editors, new portraits and one long read — to your inbox, once a month.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubbed(true);
        }}
        className="flex gap-[10px] max-w-[460px] mx-auto flex-wrap justify-center"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          type="email"
          className="flex-1 min-w-[210px] bg-transparent border-0 border-b border-ink py-3 px-1 font-news text-[16px] outline-none text-ink"
        />
        <button
          type="submit"
          className="pillbtn cursor-pointer border-none bg-ink text-ondark font-hanken text-[11px] font-semibold tracking-[.2em] uppercase py-[13px] px-[26px] rounded-[2px]"
        >
          {subbed ? "Joined ✓" : "Join"}
        </button>
      </form>
    </section>
  );
}
