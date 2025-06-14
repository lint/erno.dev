import React from "react";
import { useParams } from "react-router-dom";
import StereoNoiseCanvas from "../../components/canvas/StereoNoiseCanvas";
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
    case "stereo_noise":
      component = <StereoNoiseCanvas />;
      break;
    default:
      return <ErrorPage message="404" />;
  }

  return <BasePage>{component}</BasePage>;
}
