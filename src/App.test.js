import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the CarStore placeholder", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /carstore/i })).toBeInTheDocument();
});
