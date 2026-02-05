import { Fragment, ReactNode, useState } from "react";
import { IoFilter, IoSearch } from "react-icons/io5";
import { IconControl } from "../../display/Icon.js";
import { Span } from "../../display/Text.js";
import { Button } from "../../inputs/Button.js";
import { Input } from "../../inputs/Input.js";
import { Breakpoint } from "../../layout/Breakpoint.js";
import { Col, Row } from "../../layout/FlexBox.js";
import { Modal } from "../../overlays/Modal.js";
import { Popover } from "../../overlays/Popover.js";

type FilterProps = {
  title: ReactNode;
  query: {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onClear: () => void;
  };
  filters?: {
    label: string;
    description?: string;
    active: boolean;
    content: ReactNode;
    onClear?: () => void;
  }[];
};

export function Filters({ title, query, filters }: FilterProps) {
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);

  const activeFilters = filters?.filter((filter) => filter.active)?.length ?? 0;

  return (
    <Input
      type="search"
      size="l"
      value={query.value}
      onChange={query.onChange}
      onClear={query.onClear}
      placeholder={query.placeholder}
      left={
        <IconControl color="default" as="span" size="m">
          <IoSearch />
        </IconControl>
      }
      right={
        !!filters?.length && (
          <Breakpoint.Switch>
            <Breakpoint.UpTo size="m">
              <FiltersIcon
                activeCount={activeFilters}
                onClick={() => setIsFilterOverlayOpen((x) => !x)}
              />

              <Modal
                title={title}
                open={isFilterOverlayOpen}
                onClose={() => setIsFilterOverlayOpen(false)}
                footer={
                  <Row alignX="end">
                    <Button onClick={() => setIsFilterOverlayOpen(false)}>
                      Apply filters
                    </Button>
                  </Row>
                }
              >
                <FiltersFilters filters={filters} />
              </Modal>
            </Breakpoint.UpTo>

            <Breakpoint.Else>
              <Popover
                open={isFilterOverlayOpen}
                onClickOutside={() => setIsFilterOverlayOpen(false)}
                onOffScreen={() => setIsFilterOverlayOpen(false)}
                placements={["bottom", "right", "left", "top"]}
                offset={4}
                content={
                  <div style={{ width: 350 }}>
                    <FiltersFilters filters={filters} />
                  </div>
                }
              >
                <FiltersIcon
                  activeCount={activeFilters}
                  onClick={() => setIsFilterOverlayOpen((x) => !x)}
                />
              </Popover>
            </Breakpoint.Else>
          </Breakpoint.Switch>
        )
      }
    />
  );
}

function FiltersIcon({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <IconControl
      as="button"
      size="s"
      title="Filters"
      color={activeCount ? "secondary" : "default"}
      onClick={onClick}
      badge={activeCount ? `${activeCount}` : undefined}
    >
      <IoFilter />
    </IconControl>
  );
}

function FiltersFilters({ filters }: Pick<FilterProps, "filters">) {
  return (
    <Col p={2}>
      {filters?.map((filter, ix) => (
        <Fragment key={ix}>
          {ix !== 0 && <hr />}

          <Col gap={0}>
            <Row alignX="space-between">
              <Span bold>{filter.label}</Span>

              {filter.onClear && filter.active && (
                <Button
                  color="secondary"
                  variant="plain"
                  style={{ padding: 0, scale: 0.9 }}
                  onClick={filter.onClear}
                >
                  Clear
                </Button>
              )}
            </Row>

            {filter.description && (
              <Span size="caption" color="muted">
                {filter.description}
              </Span>
            )}
          </Col>

          {filter.content}
        </Fragment>
      ))}
    </Col>
  );
}
