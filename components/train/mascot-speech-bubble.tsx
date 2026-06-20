type MascotSpeechBubbleProps = {
  message: string;
};

export function MascotSpeechBubble({ message }: MascotSpeechBubbleProps) {
  return (
    <div className="relative max-w-xs rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      <div className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" />
    </div>
  );
}
