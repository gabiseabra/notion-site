import css from "./DateLabel.module.scss";

type DateLabelProps = {
  verb: string;
  start: Date;
  end?: Date | null;
};

export function DateLabel({ verb, start, end }: DateLabelProps) {
  return (
    <span className={css.DateLabel}>
      {verb}

      <span>@</span>

      {start.toLocaleDateString()}

      {end && (
        <>
          <span>—</span>

          {end.toLocaleDateString()}
        </>
      )}
    </span>
  );
}
