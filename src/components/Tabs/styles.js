const styles = theme => ({
    container: {
    },
    tabs: {
        backgroundColor: '#14182B',
        borderRadius: 20,
        height: 38,
        '& .MuiTab-root': {
            minWidth: 70,
        },
        '& .MuiTab-textColorPrimary': {
            fontWeight: 600,
            letterSpacing: 0.2,
            color: '#484F7F',
        },
        '& .Mui-selected': {
            backgroundColor: '#484F7F',
            borderRadius: 20,
            color: 'white',
            border: '3px solid #14182B',
        },
    },
});

export default styles;
