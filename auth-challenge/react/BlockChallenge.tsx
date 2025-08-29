import axios from 'axios'

import React, { useState, useEffect } from 'react'
import {
  ExtensionPoint,
  Session,
  SessionResponse,
  SessionUnauthorized,
  SessionForbidden,
} from 'vtex.render-runtime'

import useSessionResponse from './hooks/useSessionResponse'

const isSessionUnauthorized = (
  session: SessionResponse | undefined
): session is SessionUnauthorized =>
  (session as SessionUnauthorized)?.type?.toLowerCase() === 'unauthorized'

const isSessionForbidden = (
  session: SessionResponse | undefined
): session is SessionForbidden =>
  (session as SessionForbidden)?.type?.toLowerCase() === 'forbidden'

const isProfileAllowed = (sessionResponse: SessionResponse | undefined, listaVIPs: string) => {
  if (sessionResponse == null) {
    return null
  }

  const hasAccessToTradePolicy = (sessionResponse as Session).namespaces?.store
    ?.channel

  const isLoggedIn = (sessionResponse as Session).namespaces?.profile?.email

  const email = (sessionResponse as any).namespaces?.profile?.email?.value;

  console.log(listaVIPs.includes(email))

  if (isLoggedIn && hasAccessToTradePolicy) {
    return 'authorized'
  }

  if (isLoggedIn) {
    return 'forbidden'
  }

  return 'unauthorized'
}

interface Props {
  listaVIPs: string
}

const BlockChallenge = (props: Props) => {
  const [isVip, setIsVip] = useState<boolean | null>(null)

  const fetchVip = async (sessionResponsevip: any ) => {
    const email = (sessionResponsevip as any).namespaces?.profile?.email?.value;

    try {
      const { data } = await axios(
        `/api/dataentities/PV/search?email=${email}&_fields=email`
      )

      if (data.length) {
        setIsVip(true)
      }
    } catch {
    }
  }

  const { listaVIPs } = props

  const sessionResponse = useSessionResponse()

  useEffect(() => {
    if (!isVip){
      fetchVip(sessionResponse)
    } 
  }, [fetchVip, isVip])

  const isUnauthorized = isSessionUnauthorized(sessionResponse)
  const isForbidden = isSessionForbidden(sessionResponse)
  const profileCondition = isProfileAllowed(sessionResponse, listaVIPs)

  if (!sessionResponse) {
    return null
  }
  
  const defaultHidden = sessionResponse == null

  if (
    defaultHidden ||
    isUnauthorized === true ||
    isForbidden === true ||
    profileCondition === 'unauthorized' ||
    profileCondition === 'forbidden' ||
    isVip === null ||
    !isVip
  ) {
    return <ExtensionPoint id="challenge-fallback" />
  }

  return <ExtensionPoint id="challenge-content" />
}

BlockChallenge.defaultProps = {
  listaVIPs: "joaoeduardo.lolis@corebiz.ag",
};

BlockChallenge.schema = {
  title: 'Lista VIPS',
  type: 'object',
  properties: {
    listaVIPs: {
      title: 'Lista VIPS',
      type: 'string',
      widget: {
       'ui:widget': 'textarea'
      }
    },
  },
}

export default BlockChallenge
