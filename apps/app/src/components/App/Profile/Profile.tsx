import { TextInput, Button, RichTextEditor, Page, Box, Item, FileUpload, Gap, Select, AspectRatio, FileDrop, Dropdown, StyleHTML, markdownToHTML, useDialog, ContextMenu, ItemProps, LineBreak, GroupRadius } from '@avsync.live/formation'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSpaces_currentUser, useSpaces_currentUserId, useSpaces_setCurrentUser } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'
import { usePersonas_activePersona, usePersonas_setActivePersonaId } from 'redux-tk/personas/hooks'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'
import { useRemoveQueryParam } from 'utils/removeEditQuery'
import { ImageDropTarget } from 'components/Util/ImageDrop'
import { ImageSuggestions } from 'components/App/Suggestions/ImageSuggestions'
import { formatDate } from 'utils/formatDate'

export const Profile = () => {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const removeQueryParam = useRemoveQueryParam()

  const setActivePersonaId = usePersonas_setActivePersonaId()
  const activePersona = usePersonas_activePersona()

  const setCurrentUser = useSpaces_setCurrentUser()

  const currentUser = useSpaces_currentUser()

  useEffect(() => {
    const { personaid } = params
    setActivePersonaId(personaid)
  }, [params, location])

  const userId = useSpaces_currentUserId()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [bio, setBio] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  
  useEffect(() => {
    setName(currentUser?.name)
    setAvatar(currentUser?.avatar ? `http://localhost:8090/api/files/users/${currentUser?.id}/${currentUser?.avatar}` : null)
    setBio(currentUser?.bio)
    setPreferences(currentUser?.preferences)
  }, [currentUser])

  async function handleUpdate() {
    if (!userId && !activePersona?.id) return
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bio', bio)
    formData.append('preferences', preferences)
    formData.append('userid', userId)
    if (file) {
      formData.append('avatar', file)
    }

    try {
      const response = await pb.collection('users').update(currentUser.id, formData)
      // @ts-ignore
      setCurrentUser(response)
      setEdit(false)
    } 
    catch (error) {
      console.error('Failed to update user:', error)
      alert('Error updating user. Check console for details.')
    }
  }

  const [edit, setEdit] = useState(location.pathname === '/profile/edit' || !!searchParams.get('edit'))

  const handleCancelEdit = useCallback(() => {
    setName(currentUser?.name)
    setBio(currentUser?.bio)
    setPreferences(currentUser?.preferences)
    setAvatar(currentUser?.avatar ? `http://localhost:8090/api/files/users/${currentUser?.id}/${currentUser?.avatar}` : null)
    setEdit(false)
    removeQueryParam('edit')
  }, [currentUser])

  const handleSignOut = () => {
    pb.authStore.clear()
    navigate('/sign-in')
  }

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      text: 'Edit',
      onClick: () => setEdit(true),
      compact: true
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'sign-out-alt',
      iconPrefix: 'fas',
      text: 'Sign out',
      onClick: () => handleSignOut(),
      compact: true
    }
  ] as ItemProps[]

  return (
    <Box mt={1}>
      <Page>
        {
          edit
            ? <Gap gap={.75}>
                {
                  avatar && <Box width='100%'>
                    <Box width={8}>
                      <ImageDropTarget
                        onFileConverted={(file) => {
                          setFile(file)
                          setAvatar(URL.createObjectURL(file))
                        }}
                      >
                        <FileDrop 
                          onFileDrop={files => {
                            const file = files?.[0]
                            if (file) {
                              setFile(file)
                              setAvatar(URL.createObjectURL(file))
                            }
                          }}
                        >
                          <AspectRatio
                            ratio={1}
                            borderRadius={500}
                            backgroundSrc={avatar}
                          />
                        </FileDrop>
                      </ImageDropTarget>
                    </Box>
                  </Box>
                }
                <ImageSuggestions 
                  placeholder='Instructions'
                  prompt={`
                    This is for an avatar. It must look good when very small.
                    Name: ${name}
                  `}
                  onFileReady={(file) => {
                    setFile(file)
                    setAvatar(URL.createObjectURL(file))
                  }}
                  square
                >
                  <FileUpload
                    minimal
                    buttonProps={{
                      icon: 'upload',
                      iconPrefix: 'fas',
                      text: 'Upload avatar',
                      compact: true,
                      expand: true
                    }}
                    onFileChange={files => {
                      const file = files?.[0]
                      if (file) {
                        setFile(file)
                        setAvatar(URL.createObjectURL(file))
                      }
                    }}
                  />
                </ImageSuggestions>
                
                <Gap disableWrap>
                  <Gap disableWrap>
                    <TextInput
                      value={name}
                      onChange={val => setName(val)}
                      label='Name'
                      onEnter={handleUpdate}
                      hero
                    />
                    <Button
                      icon={'times'}
                      iconPrefix='fas'
                      hero
                      square
                      onClick={handleCancelEdit}
                    />
                    <Button
                      icon={'check'}
                      iconPrefix='fas'
                      hero
                      square
                      primary
                      onClick={handleUpdate}
                    />
                  </Gap>
                  
                </Gap>
                <RichTextEditor
                  px={1}
                  outline
                  value={bio}
                  onChange={val => setBio(val)}
                  placeholder='Bio'
                />
                <RichTextEditor
                  px={1}
                  outline
                  value={preferences}
                  onChange={val => setPreferences(val)}
                  placeholder='Preferences'
                />
              </Gap>
            : <ContextMenu
                dropdownProps={{
                  items: dropdownItems
                }}
              >
                <Gap>
                  {
                    currentUser?.avatar && <Box width='100%'>
                      <Box width={8}>
                        <AspectRatio
                          ratio={1}
                          borderRadius={500}
                          backgroundSrc={avatar}
                        />
                      </Box>
                    </Box>
                  }
                  <Item
                    pageTitle={currentUser?.name}
                    subtitle={`Joined ${formatDate(currentUser?.created)}`}
                    disablePadding
                    absoluteRightChildren
                  >
                    <Box height='100%'>
                      <Dropdown
                        icon='ellipsis-h'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        items={dropdownItems}
                      />
                    </Box>
                  </Item>
                  <Gap gap={.75}>
                    <Box mb={-1.25}>
                      <Item
                        subtitle='Bio'
                        disablePadding
                        compact
                      />
                    </Box>
                    <StyleHTML>
                      <div dangerouslySetInnerHTML={{ __html: markdownToHTML(bio || '') || '' }} />
                    </StyleHTML>
                    <Box mb={-1.25}>
                      <Item
                        subtitle='Preferences'
                        disablePadding
                        compact
                      />
                    </Box>
                    <StyleHTML>
                      <div dangerouslySetInnerHTML={{ __html: markdownToHTML(preferences || '') || '' }} />
                    </StyleHTML>
                  </Gap>
                </Gap>
              </ContextMenu>
        }
        
      </Page>
    </Box>
  )
}
