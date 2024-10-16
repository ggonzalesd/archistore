/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      name?: string;
      photo?: string;
    };
    error?: {
      message: string;
      status: number;
      encrypted: boolean;
    };
  }
}
