import SpammerCard from '../spammer-card';

export default function BlackList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Black List</h2>
          <p className="text-muted-foreground">
            Manage spammer annotators and review their activities
          </p>
        </div>
      </div>
      <div className="grid gap-4">
        <SpammerCard />
      </div>
    </div>
  );
}