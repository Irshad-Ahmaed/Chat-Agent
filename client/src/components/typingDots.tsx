export const TypingDots = ()=> {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300 animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300 animate-bounce delay-100" />
      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-300 animate-bounce delay-200" />
    </div>
  );
}