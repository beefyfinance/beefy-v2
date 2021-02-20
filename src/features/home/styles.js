const styles = (theme) => ({
    listHeader: {
        marginBottom: '12px',
    },
    listHeaderBtn: {
        fontSize: '10px',
        textAlign: 'right',
        textTransform: 'capitalize',
        padding: '0 25px 0 0',
        "&:hover": {
            background: 'transparent',
        },
        [theme.breakpoints.up('sm')]: {
            fontSize: '12px',
        },
        [theme.breakpoints.up('md')]: {
            fontSize: '14px',
        },
    },
    listHeaderBtnArrow: {
        position: 'absolute',
        right: '12px',
        top: '56%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '8px 5px 0',
        borderColor: 'transparent',
        transition: 'all 0.2s ease 0s',
        borderTopColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    },
    listHeaderBtnAsc: {
        borderWidth: '0 5px 8px',
        borderBottomColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
    },
    listHeaderBtnDesc: {
        borderStyle: 'solid',
        borderWidth: '8px 5px 0',
        borderTopColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
    },
    item: {
        width: '100%',
        textTransform: 'capitalize',
        background: theme.palette.type === 'dark' ? '#505067' : '#faf6f1',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: theme.palette.type === 'dark' ? '#1a1a43' : '#DED9D5',
        marginBottom: '12px',
        padding: '12px',
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
    }
});

export default styles;