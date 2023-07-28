import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getRandomSpirit } from "../models/Spirit.server";

export async function loader() {
  return json({ spirit: await getRandomSpirit() });
}

export default function Index() {
  const { spirit } = useLoaderData();
  return (
    <div>{JSON.stringify(spirit)}</div>
  );
}
