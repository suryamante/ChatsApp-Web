@keyframes rotate{
	from{
		transform: rotate(0);
	}
	to{
		transform: rotate(360deg);
	}
}
@keyframes bottomrotate{
	from{
		bottom: 50px;
	}
	to{
		bottom: 5px;
	}
}
export const CircularProgress = (props) => {
	return(
		<div class='circular-loading'
			style={
				width: '50px';
				position: 'relative';
				height: '50px';
				display: 'flex';
				justifyContent: 'center';
				alignItems: 'center';
				backgroundColor: 'dodgerblue';
				borderRadius: '50%';
				animation: 'rotate 1s infinite linear';
			}>
			<div class='outer-circle'
				style={
					width: '50px';
					position: 'absolute';
					bottom: '50px';
					transform: 'rotate(45deg)';
					height: '50px';
					backgroundColor: 'white';
					borderRadius: '50%';
					animation: 'bottomrotate';
					animationDuration: '1.5s';
					animationDirection: 'alternate-reverse';
					animationIterationCount: 'infinite';
					animationTimingFunction: 'ease-in-out';
				}/>
			<div class='inner-circle'
				style{
					width: '46px';
					height: '46px';
					backgroundColor: 'white';
					borderRadius: '50%';
				}/>
		</div>
	);
}