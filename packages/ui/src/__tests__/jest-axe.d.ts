declare module "jest-axe" {
  export type AxeNodeResult = {
    id: string;
    impact?: string;
    help: string;
    helpUrl?: string;
    nodes: Array<unknown>;
  };

  export type AxeResults = {
    violations: AxeNodeResult[];
    passes: AxeNodeResult[];
    incomplete: AxeNodeResult[];
    inapplicable: AxeNodeResult[];
  };

  export function axe(
    html:
      | string
      | Element
      | DocumentFragment
      | import("react").ReactElement
      | undefined,
    options?: unknown
  ): Promise<AxeResults>;
}

declare module "jest-axe/extend-expect";

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
