export default function ChatMessage({ message }: any) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"}
        `}
      >
        {message.content}
      </div>
    </div>
  );
}
