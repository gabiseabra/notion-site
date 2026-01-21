import { Fragment, ReactNode, useState } from "react";
import { IoFilter, IoSearch } from "react-icons/io5";
import { Input } from "../form/Input.js";
import { Col } from "../layout/FlexBox.js";
import { Popover } from "../layout/Popover.js";
import { IconButton } from "../typography/IconButton.js";
import { Span } from "../typography/Text.js";

type FilterProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  filters?: {
    label: string;
    description?: string;
    active: boolean;
    content: ReactNode;
  }[];
};

export function Filters({
  value,
  onChange,
  onClear,
  placeholder,
  filters,
}: FilterProps) {
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);

  const activeFilters = filters?.filter((filter) => filter.active)?.length ?? 0;

  return (
    <Input
      type="search"
      size="l"
      value={value}
      onChange={onChange}
      onClear={onClear}
      placeholder={placeholder}
      left={
        <IconButton as="span" size="m">
          <IoSearch />
        </IconButton>
      }
      right={
        !!filters?.length && (
          <Popover
            open={isFilterOverlayOpen}
            onClickOutside={() => setIsFilterOverlayOpen(false)}
            onOffScreen={() => setIsFilterOverlayOpen(false)}
            placements={["bottom", "right", "left", "top"]}
            offset={4}
            content={
              <Col p={2} style={{ width: 330 }}>
                {filters?.map((filter, ix) => (
                  <Fragment key={ix}>
                    {ix !== 0 && <hr />}

                    <Col gap={0}>
                      <Span bold>{filter.label}</Span>

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
            }
          >
            <IconButton
              as="button"
              size="s"
              title="Filters"
              color={activeFilters ? "secondary" : "default"}
              onClick={() => setIsFilterOverlayOpen((x) => !x)}
              badge={activeFilters ? `${activeFilters}` : undefined}
            >
              <IoFilter />
            </IconButton>
          </Popover>
        )
      }
    />
  );
}
