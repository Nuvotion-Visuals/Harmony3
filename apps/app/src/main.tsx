import ReactDOM from 'react-dom/client'

// Font Awesome
import '@fortawesome/fontawesome-svg-core/styles.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import * as far from '@fortawesome/free-regular-svg-icons'
import * as fas from '@fortawesome/free-solid-svg-icons'

import { Provider } from 'react-redux'
import { store } from 'redux-tk/store'

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import './index.css'
import '@avsync.live/formation/dist/index.dark.css'
import { App } from './App'
import { Linker, Ripple } from '@avsync.live/formation'
import { Link } from 'components/Util/Link'
import { RouteTracker } from 'components/App/RouteTracker'
import { SignIn } from 'components/SignIn'
import { SignUp } from 'components/SignUp'

library.add(
   // regular
   far.faHeart, far.faPaperPlane, far.faCheckSquare, far.faSquare,
   fas.faEnvelope, far.faTrashAlt, far.faBookmark, far.faCircle, far.faCircleDot,
 
   // solid
   fas.faInfoCircle, fas.faBars, fas.faHeart, fas.faPlus,
   fas.faEllipsisV, fas.faPaperPlane, fas.faCalendarAlt,
   fas.faArrowRight, fas.faArrowLeft, fas.faClock, fas.faSearch,
   fas.faSortAlphaUp, fas.faSortAlphaDown, fas.faFilter,
   fas.faChevronCircleRight, fas.faChevronCircleLeft, fas.faEnvelope,
   fas.faCheck, fas.faExclamationTriangle, fas.faUser, fas.faLock,
   fas.faPhone, fas.faUsers, fas.faTasks, fas.faCheckSquare,
   fas.faCompass, fas.faHashtag, fas.faBell, fas.faChevronLeft,
   fas.faChevronRight, fas.faChevronDown, fas.faChevronUp,
   fas.faTrashAlt, fas.faMapMarkerAlt, fas.faEdit, fas.faMoneyCheckDollar,
   fas.faUserPlus, fas.faAddressCard, fas.faHandshakeAngle,
   fas.faArchive, fas.faShare, fas.faTimes, fas.faMessage,
   fas.faHashtag, fas.faMapPin, fas.faBookmark, fas.faDownload,
   fas.faExternalLink, fas.faCrop, fas.faImage, fas.faUserCircle,
   fas.faEraser, fas.faImage, fas.faChevronDown, fas.faChevronUp, 
   fas.faSort, fas.faArrowUp, fas.faArrowDown, fas.faThumbTack,
   fas.faCircle, fas.faCircleDot, fas.faGlobe, fas.faLink,
   fas.faArrowRight, fas.faPaperPlane, fas.faCaretDown, fas.faCaretRight,
   fas.faHashtag, fas.faCaretUp, fas.faCloudUpload, fas.faUpload,
   fas.faFolder, fas.faPlay, fas.faPause, fas.faVolumeMute, fas.faVolumeHigh,
   fas.faExpand, fas.faRepeat, fas.faSearch, fas.faUndo, fas.faRedo,
   fas.faFastBackward, fas.faFastForward, fas.faMagnet, fas.faClapperboard,
   fas.faPhotoVideo, fas.faArrowUpFromBracket, fas.faArrowsLeftRightToLine,
   fas.faMagnifyingGlassMinus, fas.faMagnifyingGlassPlus, fas.faCog,
   fas.faScissors, fas.faEyedropper, fas.faGrip, fas.faList, fas.faAddressCard,
   fas.faCaretRight, fas.faCaretLeft, fas.faAngleLeft, fas.faAngleRight, 
   fas.faAnglesLeft, fas.faAnglesRight, fas.faCamera, fas.faSquareCheck,
   fas.faRepeat, fas.faCopy, fas.faSync,
   fas.faBold, fas.faItalic, fas.faUnderline, fas.faListOl, fas.faListUl, fas.faLink,
   fas.faImage, fas.faVideo, fas.faCode, fas.faEraser, fas.faFileVideo, fas.faFileCode,
   fas.faTerminal, fas.faQuoteRight, fas.faEllipsisH, fas.faReply, fas.faSave,
   fas.faDiagramProject, fas.faBoltLightning, fas.faSignOutAlt, fas.faImage,
   fas.faCircleUp, fas.faCircleDown
)

const Main = ({ }) => {
  return (
      <Provider store={store}>
        <BrowserRouter>
          <Linker CustomLink={Link}> 
            <Ripple />
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/" element={<App><></></App>} />
              <Route path="/profile" element={<App><RouteTracker /></App>} />
              <Route path="/spaces" element={<App><RouteTracker /></App>}></Route>
              <Route path="/spaces/:spaceid" element={<App><RouteTracker /></App>}>
                <Route path="groups/:groupid" element={<App><RouteTracker /></App>}>
                  <Route path="channels/:channelid" element={<App><RouteTracker /></App>}>
                    <Route path="threads/:threadid" element={<App><RouteTracker /></App>}>
                      <Route path="messages/:messageid" element={<App><RouteTracker /></App>} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Linker>
        </BrowserRouter>
      </Provider>
  )
}

const init = async () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)
}

document.addEventListener('contextmenu', event => event.preventDefault())
document.addEventListener('mousedown', event => {
  if (event.button === 1) {
    event.preventDefault()
  }
})

init()