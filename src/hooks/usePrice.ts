import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SolPrice } from "../types";

export default function usePrice(): SolPrice | null {
  const [price, setPrice] = useState<SolPrice | null>(null);
  useEffect(() => {
    let alive = true;
    api.getPrice().then((p) => alive && setPrice(p));
    return () => {
      alive = false;
    };
  }, []);
  return price;
}
