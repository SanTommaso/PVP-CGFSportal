import { mockAdapter } from "./mockAdapter.js";
import { prismaAdapter } from "./prismaAdapter.js";

const source = import.meta.env.VITE_DATA_SOURCE || "mock";

export const dataClient = source === "prisma" ? prismaAdapter : mockAdapter;
export const dataSource = source;
