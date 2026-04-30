import { GalleryProvider } from "./Gallery.js";
import { Image } from "./Image.js";

const thumbStyle = {
  width: 80,
  height: 80,
  objectFit: "cover",
  display: "block",
} as const;

const src = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="80" height="80" fill="white"/>
      <text x="40" y="45" text-anchor="middle" font-size="24">${label}</text>
    </svg>
  `)}`;

describe("Gallery", () => {
  it("keeps Image standalone when there is no provider", () => {
    cy.mount(
      <>
        <div id="modal-portal" />

        <Image title="A" src={src("A")} style={thumbStyle} />
      </>,
    );

    cy.get('img[title="A"]').click();
    cy.get('#modal-portal img[title="A"]').should("exist");

    cy.get("body").trigger("keydown", { key: "Escape" });
    cy.get('#modal-portal img[title="A"]').should("not.exist");
  });

  it("moves right across a row and falls to the first image below", () => {
    cy.mount(
      <>
        <div id="modal-portal" />

        <GalleryProvider>
          <div
            data-cy="gallery"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 80px",
              gap: 16,
            }}
          >
            <Image title="A" alt="A" src={src("A")} style={thumbStyle} />
            <Image title="B" alt="B" src={src("B")} style={thumbStyle} />
            <Image title="C" alt="C" src={src("C")} style={thumbStyle} />
            <Image title="D" alt="D" src={src("D")} style={thumbStyle} />
          </div>
        </GalleryProvider>
      </>,
    );

    cy.get('[data-cy="gallery"] img[title="A"]').click();
    cy.get('#modal-portal img[title="A"]').should("exist");

    cy.get("body").trigger("keydown", { key: "ArrowRight" });
    cy.get('#modal-portal img[title="B"]').should("exist");

    cy.get("body").trigger("keydown", { key: "ArrowRight" });
    cy.get('#modal-portal img[title="C"]').should("exist");
  });

  it("moves left across row boundaries", () => {
    cy.mount(
      <>
        <div id="modal-portal" />

        <GalleryProvider>
          <div
            data-cy="gallery"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 80px",
              gap: 16,
            }}
          >
            <Image title="A" src={src("A")} style={thumbStyle} />
            <Image title="B" src={src("B")} style={thumbStyle} />
            <Image title="C" src={src("C")} style={thumbStyle} />
            <Image title="D" src={src("D")} style={thumbStyle} />
          </div>
        </GalleryProvider>
      </>,
    );

    cy.get('[data-cy="gallery"] img[title="C"]').click();
    cy.get('#modal-portal img[title="C"]').should("exist");

    cy.get("body").trigger("keydown", { key: "ArrowLeft" });
    cy.get('#modal-portal img[title="B"]').should("exist");
  });

  it("moves vertically by rendered position", () => {
    cy.mount(
      <>
        <div id="modal-portal" />

        <GalleryProvider>
          <div
            data-cy="gallery"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 80px",
              gap: 16,
            }}
          >
            <Image title="A" src={src("A")} style={thumbStyle} />
            <Image title="B" src={src("B")} style={thumbStyle} />
            <Image title="C" src={src("C")} style={thumbStyle} />
            <Image title="D" src={src("D")} style={thumbStyle} />
          </div>
        </GalleryProvider>
      </>,
    );

    cy.get('[data-cy="gallery"] img[title="A"]').click();
    cy.get('#modal-portal img[title="A"]').should("exist");

    cy.get("body").trigger("keydown", { key: "ArrowDown" });
    cy.get('#modal-portal img[title="C"]').should("exist");

    cy.get("body").trigger("keydown", { key: "ArrowUp" });
    cy.get('#modal-portal img[title="A"]').should("exist");
  });

  it("enables and disables horizontal buttons", () => {
    cy.mount(
      <>
        <div id="modal-portal" />

        <GalleryProvider>
          <div
            data-cy="gallery"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 80px",
              gap: 16,
            }}
          >
            <Image title="A" src={src("A")} style={thumbStyle} caption="A" />
            <Image title="B" src={src("B")} style={thumbStyle} caption="B" />
            <Image title="C" src={src("C")} style={thumbStyle} caption="C" />
            <Image title="D" src={src("D")} style={thumbStyle} caption="D" />
          </div>
        </GalleryProvider>
      </>,
    );

    cy.get('[data-cy="gallery"] img[title="A"]').click();
    cy.get('button[title="Previous image"]').should("be.disabled");
    cy.get('button[title="Next image"]').should("not.be.disabled");

    cy.get("body").trigger("keydown", { key: "ArrowRight" });
    cy.get("body").trigger("keydown", { key: "ArrowRight" });
    cy.get("body").trigger("keydown", { key: "ArrowRight" });

    cy.get('#modal-portal img[title="D"]').should("exist");
    cy.get('button[title="Next image"]').should("be.disabled");
  });
});
