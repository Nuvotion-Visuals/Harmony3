import {
  Spacer,
  Box,
  ExpandableLists,
  Dropdown,
  LabelColor,
  ContextMenu,
  ItemProps,
  LineBreak,
} from '@avsync.live/formation'
import { CreateChannel } from 'components/Create/CreateChannel'
import { CreateGroup } from 'components/Create/CreateGroup'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces_activeChannelId, useSpaces_activeGroupId, useSpaces_activeSpace, useSpaces_activeSpaceGroups } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'
import styled from 'styled-components'

type List = {
  id: string
  expanded: boolean,
  value: {
    item: {
      label: string,
      labelColor: LabelColor
    },
    list: {
      subtitle: string,
      href: string
      id: string
    }[]
  }
}

const generateGroupsList = (groups, activeSpaceId, activeGroupId, activeChannelId) => {
  return groups.map(group => ({
    expanded: true,
    id: group.id,
    value: {
      item: {
        text: group.name, // Using 'name' as the label for the group
        labelColor: 'none' as LabelColor, // Type assertion for 'LabelColor'
        active: activeChannelId === null && activeGroupId === group.id
      },
      list: group.channels.map(channel => ({
        subtitle: `${channel.name}`, // Use the real channel name
        active: channel.id === activeChannelId,
        id: channel.id,
        compact: true,
        href: `/spaces/${activeSpaceId}/groups/${group.id}/channels/${channel.id}`
      }))
    }
  }))
}

export const Groups = React.memo(() => {
  const navigate = useNavigate()

  const activeSpace = useSpaces_activeSpace()
  const activeGroupId = useSpaces_activeGroupId()
  const activeSpaceGroups = useSpaces_activeSpaceGroups()
  const activeChannelId = useSpaces_activeChannelId()

  const [groupsList, setGroupsList] = useState<List[]>(() => generateGroupsList(activeSpaceGroups, activeSpace?.id, activeGroupId, activeChannelId))

  useEffect(() => {
    if (activeSpace?.id) {
      setGroupsList(generateGroupsList(activeSpaceGroups, activeSpace.id, activeGroupId, activeChannelId))
    }
    console.log(activeSpaceGroups)
  }, [activeSpaceGroups, activeSpace?.id, activeChannelId])

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await pb.collection('groups').delete(groupId)
      if (activeGroupId === groupId) {
        navigate(`/spaces/${activeSpace.id}`)
      }
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await pb.collection('channels').delete(channelId)
      if (activeChannelId === channelId) {
        navigate(`/spaces/${activeSpace.id}/groups/${activeGroupId}`)
      }
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  return (
    <>
      <ExpandableLists
        value={groupsList.map((expandableList, i) => {
          const groupDropdownItems = [
            {
              icon: 'arrow-right',
              iconPrefix: 'fas',
              compact: true,
              text: 'Visit',
              href: `/spaces/${activeSpace?.id}/groups/${expandableList?.id}`
            },
            {
              icon: 'edit',
              iconPrefix: 'fas',
              compact: true,
              text: 'Edit',
              href: `/spaces/${activeSpace?.id}/groups/${expandableList?.id}?edit=true`
            },
            {
              children: <LineBreak color='var(--F_Font_Color_Disabled)' />
            },
            {
              icon: 'trash-alt',
              iconPrefix: 'fas',
              compact: true,
              text: 'Delete',
              onClick: () => handleDeleteGroup(expandableList?.id) 
            }
          ] as ItemProps[]

          return ({
            reorderId: `list_${i}`,
            ...expandableList,
            value: {
              item: {
                ...expandableList.value.item,
                iconPrefix: 'fas',
                children: <S.Overlay>
                  <ContextMenu
                    dropdownProps={{
                      items: groupDropdownItems
                    }}
                  >
                    <Box width='100%' height='100%'>
                      <Spacer />
                      <Dropdown
                        icon='ellipsis-h'
                        iconPrefix='fas'
                        compact
                        minimal
                        square
                        items={groupDropdownItems}
                      />
                    </Box>
                  </ContextMenu>
                </S.Overlay>
              },
              list: [
                ...expandableList.value.list.map(listItem => {
                  const dropdownItems = [
                    {
                      icon: 'arrow-right',
                      iconPrefix: 'fas',
                      compact: true,
                      text: 'Visit',
                      href: `/spaces/${activeSpace?.id}/groups/${expandableList?.id}/channels/${listItem?.id}`
                    },
                    {
                      icon: 'edit',
                      iconPrefix: 'fas',
                      compact: true,
                      text: 'Edit',
                      href: `/spaces/${activeSpace?.id}/groups/${expandableList?.id}/channels/${listItem?.id}?edit=true`
                    },
                    {
                      children: <LineBreak color='var(--F_Font_Color_Disabled)' />
                    },
                    {
                      icon: 'trash-alt',
                      iconPrefix: 'fas',
                      compact: true,
                      text: 'Delete',
                      onClick: () => handleDeleteChannel(listItem?.id)

                    }
                  ] as ItemProps[]
                  return ({
                    ...listItem,
                    children: <S.Overlay>
                      <ContextMenu
                        dropdownProps={{
                          items: dropdownItems
                        }}
                      >
                        <Box width='100%'>
                          <Spacer />
                          <Dropdown
                            icon='ellipsis-h'
                            iconPrefix='fas'
                            compact
                            minimal
                            square
                            onClick={(e) => e.preventDefault()}
                            items={dropdownItems}
                          />
                        </Box>
                      </ContextMenu>
                    </S.Overlay>
                  })
                }),
                {
                  children: <CreateChannel groupId={expandableList?.id} />,
                  disablePadding: true
                }
              ]
            }
          })
        })}
        onExpand={index => setGroupsList(groupsList.map((item, i) => i === index ? ({...item, expanded: !item.expanded}) : item))}
      />
      <Box height='var(--F_Input_Height)'>
        <CreateGroup spaceId={activeSpace?.id} />
      </Box>
    </>
  )
})

const S = {
  Overlay: styled.div`
    position: absolute;
    display: flex;
    justify-content: right;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  `
}