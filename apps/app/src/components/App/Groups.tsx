import {
  Spacer,
  Box,
  ExpandableLists,
  Dropdown,
  LabelColor,
} from '@avsync.live/formation'
import React, { useEffect, useState } from 'react'
import { useHarmony_activeSpaceGroups } from 'redux-tk/harmony/hooks'

type List = {
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

const generateGroupsList = (groups) => {
  return groups.map(group => ({
    expanded: true,
    value: {
      item: {
        label: group.name, // Assuming 'name' is the label for the group
        labelColor: 'none' as LabelColor,
      },
      list: [
        { subtitle: 'Channel 1', href: `/group/${group.id}/channel1` },
        { subtitle: 'Channel 2', href: `/group/${group.id}/channel2` }
      ]
    }
  }))
}

export const Groups = React.memo(() => {
  const activeSpaceGroups = useHarmony_activeSpaceGroups()

  const [groupsList, setGroupsList] = useState<List[]>(() => generateGroupsList(activeSpaceGroups))

  useEffect(() => {
    setGroupsList(generateGroupsList(activeSpaceGroups))
  }, [activeSpaceGroups])

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
                    minimal
                    minimalIcon
                    circle
                    items={[
                      {
                        text: 'Edit',
                        icon: 'edit',
                        iconPrefix: 'fas',
                        href: `/groups/${i}/edit`
                      },
                      {
                        text: 'Remove',
                        icon: 'trash-alt',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Remove group')
                      }
                    ]}
                  />
                </Box>
              </div>
            },
            list: expandableList.value.list.map(listItem => ({
              ...listItem,
              children: <div onClick={e => {
                e.stopPropagation()
                e.preventDefault()
              }}>
                <Box height={1.65}>
                  <Dropdown
                    icon={'ellipsis-h'}
                    iconPrefix='fas'
                    key={`dropdown_${i}`}
                    minimal
                    minimalIcon
                    items={[
                      {
                        text: 'Edit',
                        icon: 'edit',
                        iconPrefix: 'fas',
                        href: `/groups/${i}/channels/edit`
                      },
                      {
                        text: 'Suggest emoji',
                        icon: 'lightbulb',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Suggest emoji')
                      },
                      {
                        text: 'Remove',
                        icon: 'trash-alt',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Remove channel')
                      }
                    ]}
                  />
                </Box>
              </div>
            }))
          }
        }))}
        onExpand={index => setGroupsList(groupsList.map((item, i) => i === index ? ({...item, expanded: !item.expanded}) : item))}
      />
     
    </>
  )
})
