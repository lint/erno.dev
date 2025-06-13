import React from "react";
import { useParams } from "react-router-dom";
import Pixel1Canvas from "../../components/canvas/Pixel1Canvas";
import TestCanvas from "../../components/canvas/TestCanvas";
import BasePage from "../base_page";
import ErrorPage from "../error/error_page";

export default function CanvasPage() {
  const { id } = useParams();
  let component = null;

  switch (id) {
    case "test":
      component = <TestCanvas />;
      break;
    case "pixel1":
      component = <Pixel1Canvas />;
      break;
    default:
      return <ErrorPage message="404" />;
  }

  return <BasePage>{component}</BasePage>;
}
