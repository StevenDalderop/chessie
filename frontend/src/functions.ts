import { useState, useEffect } from "react"

export function makeAuthorizedFetch(url : string, json : any = {}) {
	if (!json.headers) {
		json.headers = {}
	}
	json.headers.Authorization = "Bearer " + localStorage.getItem("token")
	return fetch(url, json)
}

export const fetchDataURL = (url : string, json : any = {}) => {
	const [error, setError] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [data, setData] = useState(null)
	
	const baseURL = 'http://127.0.0.1:5000'
	
	if (!json.headers) {
		json.headers = {}
	}
	json.headers.Authorization = "Bearer " + localStorage.getItem("token")
	
	useEffect(() => {
		let is_cancelled = false
		fetch(baseURL + url, json)
			.then(res => res.json())
			.then(json => {
				if ('error' in json) {
					setError(json)
				} else if (!is_cancelled) {
					setData(json)
					setIsLoading(false)
				}
			})
			.catch(err => console.log(err))
		return () => { is_cancelled = true }
	}, [])
		
	return [data, setData, error, isLoading] as const
}

export const fetchDataURLWithPage = (url : string, json : any = {}) => {
	const [error, setError] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [data, setData] = useState(null)
	const [page, setPage] = useState<number>(1)
	
	const baseURL = 'http://127.0.0.1:5000'
	
	if (!json.headers) {
		json.headers = {}
	}
	json.headers.Authorization = "Bearer " + localStorage.getItem("token")
	
	useEffect(() => {
		let is_cancelled = false
		setError(false)
		setIsLoading(true)
		fetch(`${baseURL}${url}&page=${page}`, json)
			.then(res => res.json())
			.then(json => {
				if ('error' in json) {
					setError(json)
				} else if (!is_cancelled) {
					setData(json)
					setIsLoading(false)
				}
			})
			.catch(err => console.log(err))
		return () => { is_cancelled = true }
	}, [page])
		
	return [data, setData, page, setPage, error, isLoading] as const
}