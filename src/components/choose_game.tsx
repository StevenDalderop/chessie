import React from "react"
import Dialog from "./dialog"
import { Option, OptionMenu } from "./option_menu"

type Props = {
	onClick: (vs : string) => void
}

const ChooseGame : React.FC<Props> = (props) => {
  return (
	  <Dialog title="New game" type="" size="small" >
		<OptionMenu>
			<Option text="vs Human Offline" onClick={() => props.onClick("human")} />
			<Option text="vs Human Online" onClick={() => props.onClick("online")} />
			<Option text="vs PC" onClick={() => props.onClick("pc")} />
        </OptionMenu>
	  </Dialog>
    )
}

export default ChooseGame