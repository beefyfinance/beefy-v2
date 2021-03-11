const styles = (theme) => ({
    listHeader: {
        marginBottom: '12px',
    },
    item: {
        width: '100%',
        textTransform: 'capitalize',
        background: theme.palette.type === 'dark' ? '#505067' : '#faf6f1',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: theme.palette.type === 'dark' ? '#1a1a43' : '#DED9D5',
        marginBottom: '12px',
        padding: '20px 12px',
    },
    h2: {
        fontSize: '10px',
        fontWeight: 'bold',
        lineHeight: '18px',
        margin: 0,
        padding: 0,
        [theme.breakpoints.up('sm')]: {
            fontSize: '12px',
        },
        [theme.breakpoints.up('md')]: {
            fontSize: '16px',
        },
    },
    h3: {
        fontSize: '10px',
        fontWeight: 'normal',
        margin: 0,
        padding: 0,
        color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        [theme.breakpoints.up('sm')]: {
            fontSize: '12px',
        },
    },
    rWidth: {
        minWidth: '80px',
        [theme.breakpoints.up('sm')]: {
            minWidth: '100px',
        },
        [theme.breakpoints.up('md')]: {
            minWidth: '140px',
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: '170px',
        },
    },
    itemPaused: {
        backgroundColor: theme.palette.type === 'dark' ? '#8e7800' : '#f5d000',
    },
    itemRetired: {
        backgroundColor: theme.palette.type === 'dark' ? '#751818' : '#e57373',
    },
    itemMessage: {
        fontWeight: 'bold',
        fontSize: '11px',
        position: 'absolute',
        top: '0px',
        left: '0px',
        padding: '1px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
    }
});

export default styles;
