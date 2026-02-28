import { Outlet } from "react-router";
import * as blog from "./blog/index.js";

export const element = <Outlet />;

export const children = [blog];
