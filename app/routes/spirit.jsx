import spiritStyles from "~/styles/spirit.css";
import { Outlet } from "@remix-run/react";

export const links = () => [
  { rel: "stylesheet", href: spiritStyles }
];


export default function SpiritLayout() {
  return <Outlet />;
}