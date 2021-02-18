import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { classes } from '../../utils';
import { Button, ButtonProps } from '../Button';

import './stylesheet.scss';

type BaseActionRowProps = {
  label: string;
  actions: Action[];
  className?: string;
  children?: React.ReactNode;
};
export type ActionRowProps = BaseActionRowProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof BaseActionRowProps>;

type FontAwesomeProps = React.ComponentProps<typeof FontAwesomeIcon>;
export type Action = {
  icon: FontAwesomeProps['icon'];
  styling?: React.CSSProperties;
  dataTip?: string;
  dataFor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
} & Omit<ButtonProps, 'children'>;

export function ActionRow({
  className,
  label,
  children,
  actions,
  ...restProps
}: ActionRowProps) {
  return (
    <div className={classes('ActionRow', className)} {...restProps}>
      <div className="action-row-header">
        <div className="label">{label}</div>
        <div className={classes('actions', 'default')}>
          {actions
            .filter((action) => action)
            .map(
              (
                {
                  icon,
                  styling,
                  dataTip,
                  dataFor,
                  onMouseEnter,
                  onMouseLeave,
                  ...restProps
                },
                i
              ) => (
                <Button className="action" {...restProps} key={i}>
                  <FontAwesomeIcon
                    fixedWidth
                    style={styling}
                    icon={icon}
                    data-tip={dataTip}
                    data-for={dataFor}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  />
                </Button>
              )
            )}
        </div>
      </div>
      {children}
    </div>
  );
}
