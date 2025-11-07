import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  console.log("Redirect to discovery");

  return <Redirect href="/discovery" />;
}
