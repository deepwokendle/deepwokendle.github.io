import FlipCard from './FlipCard';
import ImageWithLoader from './ImageWithLoader';
import type { GuessRecord } from '../../types';

interface Props {
  record: GuessRecord;
  baseDelay?: number;
  instant?: boolean;
}

export default function GuessRow({ record, baseDelay = 0, instant = false }: Props) {
  const { monster, fields } = record;
  const src = monster.picture;

  return (
    <div className="col-md-12 rowGuessed">
      <FlipCard result="picture" delay={baseDelay} instant={instant}>
        <ImageWithLoader src={src} alt={monster.name} className="itemImg" />
      </FlipCard>
      {fields.map((f, i) => (
        <FlipCard key={f.field} result={f.result} delay={baseDelay + (i + 1) * 300} instant={instant}>
          {f.display}
        </FlipCard>
      ))}
    </div>
  );
}
