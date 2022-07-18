import type { NextPage } from "next";
import { Box, Flex, IconButton, Text, useMediaQuery } from "@chakra-ui/react";
import Header from "../comps/Header";
import NewChatComp from "../comps/NewChat";
import { PhoneIcon, SettingsIcon } from "@chakra-ui/icons";
import { ArchiveIcon, PencilAltIcon } from "@heroicons/react/outline";
import SmChats from "../comps/SmChats";
import { ReactNode, useEffect } from "react";
import { useAuthUser } from "@react-query-firebase/auth";
import { auth, db } from "../firebase/firebase";
import { SpinnerDotted } from "spinners-react";
import {
  collection,
  doc,
  DocumentData,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import Chat from "./Chat";
import { useRouter } from "next/router";
import Settings from "./Settings";
import {
  useCollectionData,
  useDocumentData,
  useCollection,
} from "react-firebase-hooks/firestore";

const View = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const user = auth.currentUser;
  const chatsQuery = query(
    collection(db, "chatGroup"),
    where("USID", "array-contains", `${user?.uid}`),
    orderBy("timeStamp", "desc")
  );
  const userRef = doc(db, "Users", `${user?.uid}`);
  const [chats] = useCollection(chatsQuery);
  const [userData] = useDocumentData(userRef);

  const responsiveLayout = (chatPage: string, noChatPage: string) => {
    if (!!router.query?.chat) return chatPage;
    else return noChatPage;
  };

  return (
    <Flex h="100vh" w="100%" bgColor="gray.200" pos="fixed">
      <Box
        display={[
          responsiveLayout("none", "block"),
          responsiveLayout("none", "block"),
          "block",
        ]}
        w={["full", "full", "45%", "35%", "30%"]}
        position="relative"
      >
        <Box
          sx={{
            "&::-webkit-scrollbar": {
              width: "4px",
              backgroundColor: "blue.500",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "18px",
              backgroundColor: "teal.400",
            },
          }}
          w="full"
          h="full"
          overflowY="scroll"
          borderRight={["none", "none", "2px"]}
        >
          <Header>
            <NewChatComp
              userData={userData}
              chats={chats}
              icon={<PencilAltIcon width={22} />}
            />
            <Settings userData={userData} />
          </Header>
          <SmChats>
            {!chats?.empty ? (
              <Box>
                {chats?.docs.map((chat: DocumentData | undefined) => {
                  const recId = chat?.data().USID.filter(
                    (id: DocumentData | undefined) => id !== user?.uid
                  );
                  return <Chat key={chat?.id} chatId={chat?.id} recId={recId} />;
                })}
              </Box>
            ) : (
              <Flex h="full" justify="center" align="center">
                <NewChatComp
                  userData={userData}
                  chats={chats}
                  text="Start Chat"
                />
              </Flex>
            )}
          </SmChats>
        </Box>
      </Box>
      {/* next */}
      <Box
        h="full"
        bgColor="gray.100"
        w="full"
        display={[
          responsiveLayout("block", "none"),
          responsiveLayout("block", "none"),
          "block",
        ]}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default View;
