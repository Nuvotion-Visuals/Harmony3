import {
  Spacer,
  Box,
  ExpandableLists,
  Dropdown,
  LabelColor,
} from '@avsync.live/formation'
import { CreateChannel } from 'components/Create/CreateChannel'
import { CreateGroup } from 'components/Create/CreateGroup'
import React, { useEffect, useState } from 'react'
import { useHarmony_activeChannelId, useHarmony_activeGroupId, useHarmony_activeSpace, useHarmony_activeSpaceGroups } from 'redux-tk/harmony/hooks'

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
    }[]
  }
}

type Lists = List[]

const generateGroupsList = (groups, activeSpaceId, activeChannelId) => {
  return groups.map(group => ({
    expanded: true,
    id: group.id,
    value: {
      item: {
        label: group.name, // Using 'name' as the label for the group
        labelColor: 'none' as LabelColor, // Type assertion for 'LabelColor'
      },
      list: group.channels.map(channel => ({
        subtitle: `${channel.name}`, // Use the real channel name
        active: channel.id === activeChannelId,
        compact: true,
        href: `/spaces/${activeSpaceId}/groups/${group.id}/channels/${channel.id}`
      }))
    }
  }))
}

export const Groups = React.memo(() => {
  const activeSpace = useHarmony_activeSpace()
  const activeSpaceGroups = useHarmony_activeSpaceGroups()
  const activeGroupId = useHarmony_activeGroupId()
  const activeChannelId = useHarmony_activeChannelId()

  const [groupsList, setGroupsList] = useState<List[]>(() => generateGroupsList(activeSpaceGroups, activeSpace?.id, activeChannelId))

  useEffect(() => {
    if (activeSpace?.id) {
      setGroupsList(generateGroupsList(activeSpaceGroups, activeSpace.id, activeChannelId))
    }
  }, [activeSpaceGroups, activeSpace?.id, activeChannelId])

  return (
    <>
      <ExpandableLists
        value={groupsList.map((expandableList, i) => ({
          reorderId: `list_${i}`,
          ...expandableList,
          value: {
            item: {
              ...expandableList.value.item,
              iconPrefix: 'fas',
              children: <div onClick={e => e.stopPropagation()}>
                <Spacer />
                <Box height={2}>
                  <Dropdown
                    icon='ellipsis-h'
                    iconPrefix='fas'
                    compact
                    minimal
                    square
                    items={[
                      {
                        icon: 'edit',
                        iconPrefix: 'fas',
                        compact: true,
                        text: 'Edit',
                        onClick: () => {

                        }
                      },
                      {
                        icon: 'trash-alt',
                        iconPrefix: 'fas',
                        compact: true,
                        text: 'Delete',
                        onClick: () => {

                        }
                      }
                    ]}
                  />
                </Box>
              </div>
            },
            list: [
              ...expandableList.value.list.map(listItem => ({
              ...listItem,
              children: <Dropdown
                icon='ellipsis-h'
                iconPrefix='fas'
                compact
                minimal
                square
                items={[
                  {
                    icon: 'edit',
                    iconPrefix: 'fas',
                    compact: true,
                    text: 'Edit',
                    onClick: () => {

                    }
                  },
                  {
                    icon: 'trash-alt',
                    iconPrefix: 'fas',
                    compact: true,
                    text: 'Delete',
                    onClick: () => {

                    }
                  }
                ]}
              />
              
            })),
            {
              children: <CreateChannel
                groupId={expandableList.id}
              />,
              disablePadding: true
            }
          ]
          }
        }))}
        onExpand={index => setGroupsList(groupsList.map((item, i) => i === index ? ({...item, expanded: !item.expanded}) : item))}
      />
      <CreateGroup
        spaceId={activeSpace?.id}
      />
    </>
  )
})
