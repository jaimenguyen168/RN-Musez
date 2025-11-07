import React from "react";
import { Redirect } from "expo-router";

global.React = React;

export default function Index() {
  console.log("Redirect to discovery");

  return <Redirect href="/discovery" />;
}
