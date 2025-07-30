// 'use client';

// import axios from "axios";
// import { useEffect, useRef, useState } from "react";

// import { pusherClient } from "@/app/libs/pusher";
// import useConversation from "@/app/hooks/useConversation";
// import MessageBox from "./MessageBox";
// import { FullMessageType } from "@/app/types";
// import { find } from "lodash";

// interface BodyProps {
//   initialMessages: FullMessageType[];
// }

// const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const [messages, setMessages] = useState(initialMessages);
  
//   const { conversationId } = useConversation();

//   useEffect(() => {
//     axios.post(`/api/conversations/${conversationId}/seen`);
//   }, [conversationId]);

//   useEffect(() => {
//     pusherClient.subscribe(conversationId)
//     bottomRef?.current?.scrollIntoView();

//     const messageHandler = (message: FullMessageType) => {
//       axios.post(`/api/conversations/${conversationId}/seen`);

//       setMessages((current) => {
//         if (find(current, { id: message.id })) {
//           return current;
//         }

//         return [...current, message]
//       });
      
//       bottomRef?.current?.scrollIntoView();
//     };

//     const updateMessageHandler = (newMessage: FullMessageType) => {
//       setMessages((current) => current.map((currentMessage) => {
//         if (currentMessage.id === newMessage.id) {
//           return newMessage;
//         }
  
//         return currentMessage;
//       }))
//     };
  

//     pusherClient.bind('messages:new', messageHandler)
//     pusherClient.bind('message:update', updateMessageHandler);

//     return () => {
//       pusherClient.unsubscribe(conversationId)
//       pusherClient.unbind('messages:new', messageHandler)
//       pusherClient.unbind('message:update', updateMessageHandler)
//     }
//   }, [conversationId]);

//   return ( 
//     <div className="flex-1 overflow-y-auto">
//       {messages.map((message, i) => (
//         <MessageBox 
//           isLast={i === messages.length - 1} 
//           key={message.id} 
//           data={message}
//         />
//       ))}
//       <div className="pt-24" ref={bottomRef} />
//     </div>
//   );
// }
 
// export default Body;


'use client';

import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { pusherClient } from "@/app/libs/pusher";
import useConversation from "@/app/hooks/useConversation";
import MessageBox from "./MessageBox";
import { FullMessageType } from "@/app/types";
import { find } from "lodash";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  
  const { conversationId } = useConversation();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      // DEBUG LOG 1: Check if the event is received from Pusher
      console.log("--- PUSHER EVENT RECEIVED: messages:new ---");
      console.log("Received message object:", message);

      axios.post(`/api/conversations/${conversationId}/seen`);

      setMessages((current) => {
        // DEBUG LOG 2: Check if the message is being filtered out
        if (find(current, { id: message.id })) {
          console.log("Message ID already exists in state. Ignoring.");
          return current;
        }
        
        // DEBUG LOG 3: Confirming new message is being added
        console.log("New message detected. Adding to state.");
        return [...current, message]
      });
      
      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          return newMessage;
        }
  
        return currentMessage;
      }))
    };
  

    pusherClient.bind('messages:new', messageHandler)
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind('messages:new', messageHandler)
      pusherClient.unbind('message:update', updateMessageHandler)
    }
  }, [conversationId]);

  return ( 
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox 
          isLast={i === messages.length - 1} 
          key={message.id} 
          data={message}
        />
      ))}
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
}
 
export default Body;
