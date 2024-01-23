import { useInkathon } from '@poppyseed/lastic-sdk'
import { useEffect, useState } from 'react'

type RegionDetailItem = {
  begin: string
  core: string
  mask: string
}

type RegionDetail = RegionDetailItem[]

type RegionOwner = {
  end: string
  owner: string
  paid: string
}

type Region = {
  detail: RegionDetail
  owner: RegionOwner
}

type RegionsType = Region[]

// Custom hook for querying substrate state
function useRegionQuery() {
  const { api } = useInkathon()
  const [data, setData] = useState<RegionsType | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (api?.query?.broker?.regions) {
        try {
          const entries = await api.query.broker.regions.entries()
          const regions: RegionsType = entries.map(([key, value]) => {
            const detail = key.toHuman() as RegionDetail
            const owner = value.toHuman() as RegionOwner
            return { detail, owner }
          })
          setData(regions)
        } catch (error) {
          console.error('Failed to fetch regions:', error)
        }
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 5000)

    return () => clearInterval(intervalId)
  }, [api])

  return data
}

export default function BrokerRegionData() {
  const regionData = useRegionQuery()

  return (
    <div>
      <div>
        <b>Region Data:</b>
      </div>
      <div>
        {regionData ? (
          regionData.map((region, index) => (
            <div key={index}>
              <h3>Region {index + 1}</h3>
              <p>Begin: {region.detail[0].begin}</p>
              <p>Core: {region.detail[0].core}</p>
              <p>Mask: {region.detail[0].mask}</p>
              <p>End: {region.owner.end}</p>
              <p>Owner: {region.owner.owner}</p>
              <p>Paid: {region.owner.paid}</p>
            </div>
          ))
        ) : (
          <p>No region data available.</p>
        )}
      </div>
    </div>
  )
}
