import { Panel } from "@/components/primitives/panel";
import { KvTag } from "@/components/primitives/kv-tag";

type Props = {
  title: string;
  description: string;
  tags: { k: string; v: string }[];
};

export function RecurringClusterPanel({ title, description, tags }: Props) {
  return (
    <Panel eyebrow="Focus" title={title}>
      <p className="text-sm leading-6 text-ink-2">{description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <KvTag key={`${tag.k}-${tag.v}`} k={tag.k} v={tag.v} />
        ))}
      </div>
    </Panel>
  );
}
