import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale-subtle.css';
import type { ReactElement } from 'react';

interface Props {
  content: string;
  children: ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, placement = 'top' }: Props) {
  return (
    <Tippy
      content={content}
      theme="deepwokendle"
      animation="scale-subtle"
      placement={placement}
      delay={[250, 0]}
      arrow={true}
    >
      {children}
    </Tippy>
  );
}
