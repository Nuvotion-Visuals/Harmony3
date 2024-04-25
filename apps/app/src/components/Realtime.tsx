import React, { useState, useEffect } from 'react'
import PocketBase from 'pocketbase'
import styled from 'styled-components'
import { CreateMessage } from './Create/CreateMessage'
import { CreateThread } from './Create/CreateThread'
import { CreateGroup } from './Create/CreateGroup'
import { CreateSpace } from './Create/CreateSpace'

const pb = new PocketBase('http://127.0.0.1:8090')

export function Realtime() {
  const [spacesData, setSpacesData] = useState([])
  const [groupsData, setGroupsData] = useState([])
  const [threadsData, setThreadsData] = useState([])
  const [messagesData, setMessagesData] = useState([])

  const [userId, setUserId] = useState('')

  useEffect(() => {
    (async () => {
      await pb.collection('users').authWithPassword('tom@avsync.live', 'pizza911')
      const currentUserId = pb.authStore.model?.id
      console.log(currentUserId)
      console.log(currentUserId)
      if (currentUserId) {
        setUserId(currentUserId)
        console.log(currentUserId)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        // Authenticate as needed

        // Fetch all collections independently
        const fetchedSpaces = await pb.collection('spaces').getFullList()
        const fetchedGroups = await pb.collection('groups').getFullList()
        const fetchedThreads = await pb.collection('threads').getFullList()
        const fetchedMessages = await pb.collection('messages').getFullList()

        // Set data for all collections
        setSpacesData(fetchedSpaces)
        setGroupsData(fetchedGroups)
        setThreadsData(fetchedThreads)
        setMessagesData(fetchedMessages)

        // Subscribe to changes for real-time updates (logic for handling the updates is omitted)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    })()
  }, [])

  useEffect(() => {
    pb.collection('spaces').subscribe('*', (event) => {
      setSpacesData(prevSpaces => {
        switch (event.action) {
          case 'create':
            return [...prevSpaces, event.record]
          case 'update':
            return prevSpaces.map(space => space.id === event.record.id ? event.record : space)
          case 'delete':
            return prevSpaces.filter(space => space.id !== event.record.id)
          default:
            return prevSpaces
        }
      })
    })
  
    pb.collection('groups').subscribe('*', (event) => {
      setGroupsData(prevGroups => {
        switch (event.action) {
          case 'create':
            return [...prevGroups, event.record]
          case 'update':
            return prevGroups.map(group => group.id === event.record.id ? event.record : group)
          case 'delete':
            return prevGroups.filter(group => group.id !== event.record.id)
          default:
            return prevGroups
        }
      })
    })
  
    pb.collection('threads').subscribe('*', (event) => {
      setThreadsData(prevThreads => {
        switch (event.action) {
          case 'create':
            return [...prevThreads, event.record]
          case 'update':
            return prevThreads.map(thread => thread.id === event.record.id ? event.record : thread)
          case 'delete':
            return prevThreads.filter(thread => thread.id !== event.record.id)
          default:
            return prevThreads
        }
      })
    })
  
    pb.collection('messages').subscribe('*', (event) => {
      setMessagesData(prevMessages => {
        switch (event.action) {
          case 'create':
            return [...prevMessages, event.record]
          case 'update':
            return prevMessages.map(message => message.id === event.record.id ? event.record : message)
          case 'delete':
            return prevMessages.filter(message => message.id !== event.record.id)
          default:
            return prevMessages
        }
      })
    })
  
    
  }, [])

  // Assemble nested data structure
  const nestedSpaces = spacesData.map(space => ({
    ...space,
    groups: groupsData
      .filter(group => group.spaceid === space.id)
      .map(group => ({
        ...group,
        threads: threadsData
          .filter(thread => thread.groupid === group.id)
          .map(thread => ({
            ...thread,
            messages: messagesData.filter(message => message.threadid === thread.id),
          })),
      })),
  }))

  // Render the nested structure
  const renderNestedData = (nestedSpaces) => {
    return nestedSpaces.map(space => (
      <StyledSpace key={space.id}>
        Space: {space.name}
        {space.groups.map(group => (
          <StyledGroup key={group.id}>
            Group: {group.name}
            {group.threads.map(thread => (
              <StyledThread key={thread.id}>
                Thread: {thread.name}
                {thread.messages.map(message => (
                  <StyledMessage key={message.id}>
                    Message: {message.text}
                    
                  </StyledMessage>
                ))}
                <CreateMessage
                  userId={userId}
                  threadId={thread.id}
                  pb={pb}
                />
              </StyledThread>
              
            ))}
            <CreateThread
              userId={userId}
              groupId={group.id}
              pb={pb}
            />
          </StyledGroup>
        ))}
        <CreateGroup
          spaceId={space.id}
          userId={userId}
          pb={pb}
        />
      </StyledSpace>
    ))
  }

  return (
    <div>
      {renderNestedData(nestedSpaces)}
      <CreateSpace
        userId={userId}
        pb={pb}
      />
    </div>
  )
}

const StyledSpace = styled.div`
  margin-left: 1rem;
`

const StyledGroup = styled.div`
  margin-left: 2rem;
`

const StyledThread = styled.div`
  margin-left: 3rem;
`

const StyledMessage = styled.div`
  margin-left: 4rem;
`
