// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("指定した名前をアクセシブルなラベルとして表示する", () => {
    render(<Avatar name="花子" />);

    expect(screen.getByLabelText("花子")).toBeInTheDocument();
  });

  it("名前を省略すると既定の名前を表示する", () => {
    render(<Avatar />);

    expect(screen.getByLabelText("大地")).toBeInTheDocument();
  });
});
